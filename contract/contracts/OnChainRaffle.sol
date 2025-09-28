// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interface/IOnChainRaffle.sol";

contract OnChainRaffle is
    IEntropyConsumer,
    Ownable,
    ReentrancyGuard,
    Pausable,
    IERC721Receiver,
    IOnChainRaffle
{
    IEntropyV2 public entropy;


    // Raffle Configuration
    uint256 public constant ENTRY_PRICE = 0.1 ether; // 0.1 native IP tokens
    uint32  public constant ONE_MILLION = 1_000_000;
    uint32  public rebatePPM = 5_000; // 0.5%

    uint256 private constant GUARANTEED_RETURN_RATE = 1000; // 100% (1000/1000)
    uint256 private constant RATE_DENOMINATOR = 1000;
    uint32 private constant BONUS_EV_PPM = 5_000; // target ~0.5% EV of entry
    uint32 private constant PPM_DENOM = 1_000_000; // 1e6 (parts per million)

    // reserves and accounting
    uint256 public prizeReserve;    // ETH kept for tier payouts
    uint256 public rebateReserve;   // ETH kept for the 0.5% cash-back
    uint256 public vrfReserve;      // ETH set aside for VRF fees
    uint256 public totalEntries;

    // Raffle State
    uint256 public totalIPTokensCollected;
    bool public raffleActive = true;

    // ---- Single-outcome bonus configuration (Design A) ----
    struct BonusOutcome {
        uint32 payoutPpm; // payout as ppm of entry (e.g., 40_000 = 4%)
        uint32 probPpm;   // probability in ppm (e.g., 7_000 = 0.7%)
        bool givesNFT;    // whether this outcome also awards an NFT
    }
    BonusOutcome[] public bonus;
    uint32 public bonusProbSumPpm; // must be <= PPM_DENOM

    // Pending random requests
    struct PendingDraw {
        address user;
        uint256 entryAmount;
        uint64 sequenceNumber;
        bool processed;
    }

    // Storage
    Entry[] public allEntries;
    Prize[] public allPrizes;
    mapping(uint64 => PendingDraw) public pendingDraws; // sequenceNumber => pending draw

    // NFT Pool storage
    // Parallel arrays to support multiple NFT contracts without changing external ABI too much
    uint256[] public commonNFTPool;            // tokenIds
    address[] public commonNFTPoolContracts;   // nft contract addresses (same length as commonNFTPool)

    mapping(address => uint256[]) public userEntryIndices; // user => entry indices
    mapping(address => uint256[]) public userPrizeIndices; // user => prize indices
    mapping(address => uint256) public userTotalWinnings;
    mapping(address => uint256) public userTotalEntries;

    // Prize pool reserves (native IP tokens)
    uint256 public ipTokenReserve;

    // NFT management
    mapping(address => mapping(uint256 => bool)) public availableNFTs; // nft => tokenId => available

    constructor(address _entropy, address /*_nftContract*/) Ownable(msg.sender) {
        entropy = IEntropyV2(_entropy);
        raffleActive = true;
        _initBonusDistribution();
    }

    function _initBonusDistribution() internal {
        delete bonus;
        bonusProbSumPpm = 0;
        // Example distribution: ~0.536% EV of entry (close to 0.5%), adjust as desired.
        bonus.push(BonusOutcome({ payoutPpm: 400_000, probPpm: 7_000, givesNFT: false }));    // 0.7% chance of +40%
        bonus.push(BonusOutcome({ payoutPpm: 1_200_000, probPpm: 1_800, givesNFT: true }));   // 0.18% chance of +120% + NFT
        bonus.push(BonusOutcome({ payoutPpm: 2_000_000, probPpm: 200, givesNFT: false }));    // 0.02% chance of +200%
        bonusProbSumPpm = 7_000 + 1_800 + 200; // 0.9% any-bonus probability
        // NOTE: Expected value ≈ 0.536% of entry; tune (payoutPpm, probPpm) to hit 0.5% exactly if needed.
    }

    // Admin Functions
    function setRaffleStatus(bool _active) external onlyOwner {
        raffleActive = _active;
        emit RaffleStatusChanged(_active);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }

    // NFT Management Functions
    function depositNFTs(address nft, uint256[] calldata tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(!availableNFTs[nft][tokenId], "NFT already deposited");

            // Transfer NFT to contract
            IERC721(nft).transferFrom(msg.sender, address(this), tokenId);
            availableNFTs[nft][tokenId] = true;

            // Add to appropriate tier pool
            commonNFTPool.push(tokenId);
            commonNFTPoolContracts.push(nft);

            emit NFTDeposited(tokenId);
        }
    }

    function withdrawNFT(address nft, uint256 tokenId, address to) external onlyOwner {
        require(availableNFTs[nft][tokenId], "NFT not available");
        require(to != address(0), "Invalid address");

        availableNFTs[nft][tokenId] = false;
        _removeFromPools(nft, tokenId);
        IERC721(nft).transferFrom(address(this), to, tokenId);

        emit NFTWithdrawn(tokenId, to);
    }

    function _removeFromPools(address nft, uint256 tokenId) internal {
        // Remove from both arrays
        uint256 len = commonNFTPool.length;
        for (uint256 i = 0; i < len; i++) {
            if (commonNFTPool[i] == tokenId && commonNFTPoolContracts[i] == nft) {
                // swap with last and pop both arrays
                if (i != len - 1) {
                    commonNFTPool[i] = commonNFTPool[len - 1];
                    commonNFTPoolContracts[i] = commonNFTPoolContracts[len - 1];
                }
                commonNFTPool.pop();
                commonNFTPoolContracts.pop();
                break;
            }
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Main Raffle Functions
    function enterRaffle() external payable nonReentrant whenNotPaused {
        require(raffleActive, "Raffle is not active");
        require(msg.value >= ENTRY_PRICE, "Insufficient entry amount");
        require(
            msg.value % ENTRY_PRICE == 0,
            "Amount must be multiple of entry price"
        );

        uint256 entryCount = msg.value / ENTRY_PRICE;
        uint256 ipTokenAmount = msg.value;

        // Create entry record
        Entry memory newEntry = Entry({
            user: msg.sender,
            entryCount: entryCount,
            ipTokensSpent: ipTokenAmount,
            timestamp: block.timestamp
        });

        uint256 entryIndex = allEntries.length;
        allEntries.push(newEntry);
        userEntryIndices[msg.sender].push(entryIndex);

        // Update counters
        totalEntries += entryCount;
        totalIPTokensCollected += ipTokenAmount;
        userTotalEntries[msg.sender] += entryCount;

        // Process guaranteed return immediately
        _processGuaranteedReturn(msg.sender, ipTokenAmount);

        // Update reserves
        ipTokenReserve += ipTokenAmount;

        emit RaffleEntered(msg.sender, entryIndex, entryCount, ipTokenAmount);

        // Request random draw for potential bonus prizes
        _requestDraw(msg.sender, ipTokenAmount);
    }

    function _processGuaranteedReturn(
        address user,
        uint256 ipTokensSpent
    ) internal {
        uint256 guaranteedReturn = (ipTokensSpent * GUARANTEED_RETURN_RATE) /
            RATE_DENOMINATOR;

        require(
            address(this).balance >= guaranteedReturn,
            "Insufficient contract balance for guaranteed return - contract needs funding"
        );
        payable(user).transfer(guaranteedReturn);

        Prize memory guaranteedPrize = Prize({
            winner: user,
            tier: 1, // Tier 1 = Guaranteed return
            ipTokenAmount: guaranteedReturn,
            nftTokenId: 0, // No NFT for guaranteed return
            distributed: true,
            timestamp: block.timestamp
        });

        uint256 prizeIndex = allPrizes.length;
        allPrizes.push(guaranteedPrize);
        userPrizeIndices[user].push(prizeIndex);
        userTotalWinnings[user] += guaranteedReturn;

        emit PrizeDistributed(user, prizeIndex, guaranteedReturn, 0);
    }

    function _requestDraw(address user, uint256 entryAmount) internal {
        require(raffleActive, "Raffle not active");

        // Get entropy fee and request random number
        uint256 fee = entropy.getFeeV2();
        require(
            address(this).balance >= fee,
            "Insufficient IP for entropy fee"
        );

        uint64 sequenceNumber = entropy.requestV2{value: fee}();

        pendingDraws[sequenceNumber] = PendingDraw({
            user: user,
            entryAmount: entryAmount,
            sequenceNumber: sequenceNumber,
            processed: false
        });

        emit DrawRequested(user, sequenceNumber);
    }

    function manualRequestDraw(
        address user,
        uint256 entryAmount
    ) external onlyOwner {
        _requestDraw(user, entryAmount);
    }

    /// @notice This function is internal and guarded by IEntropyConsumer base; no external access checks needed here.
    function entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        PendingDraw storage pendingDraw = pendingDraws[sequenceNumber];
        require(!pendingDraw.processed, "Draw already processed");
        require(pendingDraw.user != address(0), "Invalid pending draw");

        pendingDraw.processed = true;

        // Process bonus based on single-outcome bonus distribution
        _processBonus(pendingDraw.user, pendingDraw.entryAmount, randomNumber);
    }

    function _processBonus(
        address user,
        uint256 entryAmount,
        bytes32 randomWord
    ) internal {
        if (bonus.length == 0 || bonusProbSumPpm == 0) return;

        uint256 x = uint256(randomWord) % PPM_DENOM; // [0, 1e6)
        uint32 acc = 0;
        for (uint i = 0; i < bonus.length; i++) {
            acc += bonus[i].probPpm;
            if (x < acc) {
                uint256 payout = (entryAmount * bonus[i].payoutPpm) / PPM_DENOM;
                uint256 nftTokenId = 0;
                address nftAddr = address(0);
                if (bonus[i].givesNFT) {
                    (nftAddr, nftTokenId) = _selectRandomNFT(commonNFTPool, commonNFTPoolContracts, randomWord, 1337 + i);
                }

                bool distributed = _distributePrizeImmediately(user, payout, nftAddr, nftTokenId);

                Prize memory prize = Prize({
                    winner: user,
                    tier: 2, // "bonus" tier
                    ipTokenAmount: payout,
                    nftTokenId: nftTokenId,
                    distributed: distributed,
                    timestamp: block.timestamp
                });

                uint256 prizeIndex = allPrizes.length;
                allPrizes.push(prize);
                userPrizeIndices[user].push(prizeIndex);
                userTotalWinnings[user] += payout;

                emit PrizeAwarded(user, prizeIndex, 2, payout, nftTokenId);
                if (distributed) {
                    emit PrizeDistributed(user, prizeIndex, payout, nftTokenId);
                }
                return; // exactly one outcome per ticket
            }
        }
        // If x >= bonusProbSumPpm: no bonus outcome
    }

    function _maxBonusPpm() internal view returns (uint32 m) {
        for (uint i = 0; i < bonus.length; i++) {
            if (bonus[i].payoutPpm > m) m = bonus[i].payoutPpm;
        }
    }

    function _selectRandomNFT(
        uint256[] storage tokenArray,
        address[] storage nftArrayAddrs,
        bytes32 randomNumber,
        uint256 offset
    ) internal returns (address nft, uint256 tokenId) {
        if (tokenArray.length == 0) {
            return (address(0), 0); // No NFT available
        }
        uint256 idx = uint256(randomNumber >> (128 + offset)) % tokenArray.length;
        nft = nftArrayAddrs[idx];
        tokenId = tokenArray[idx];
        // Remove selected NFT from pool (swap with last and pop both arrays)
        uint256 lastIdx = tokenArray.length - 1;
        if (idx != lastIdx) {
            tokenArray[idx] = tokenArray[lastIdx];
            nftArrayAddrs[idx] = nftArrayAddrs[lastIdx];
        }
        tokenArray.pop();
        nftArrayAddrs.pop();
        return (nft, tokenId);
    }

    // Internal function to immediately distribute prizes
    function _distributePrizeImmediately(
        address user,
        uint256 ipTokenAmount,
        address nftAddr,
        uint256 nftTokenId
    ) internal returns (bool success) {
        success = true;

        // Try to distribute IP tokens
        if (ipTokenAmount > 0) {
            if (address(this).balance >= ipTokenAmount) {
                payable(user).transfer(ipTokenAmount);
            } else {
                // Mark as failed if insufficient balance
                success = false;
            }
        }

        // Try to distribute NFT
        if (nftAddr != address(0) && nftTokenId > 0) {
            try IERC721(nftAddr).transferFrom(address(this), user, nftTokenId) {
                // NFT transfer successful
            } catch {
                // Mark as failed if NFT transfer fails
                success = false;
            }
        }

        return success;
    }

    // View Functions
    function getRaffleInfo()
        external
        view
        returns (
            bool active,
            uint256 totalEntriesCount,
            uint256 totalIPTokensCollectedAmount,
            uint256 contractBalance,
            uint256 nftPoolSize
        )
    {
        return (
            raffleActive,
            totalEntries,
            totalIPTokensCollected,
            address(this).balance,
            commonNFTPool.length
        );
    }

    function getUserStats(
        address user
    )
        external
        view
        returns (
            uint256 totalUserEntries,
            uint256 totalWinnings,
            uint256 distributedPrizes
        )
    {
        uint256[] storage userPrizes = userPrizeIndices[user];

        for (uint256 i = 0; i < userPrizes.length; i++) {
            if (allPrizes[userPrizes[i]].distributed) {
                distributedPrizes++;
            }
        }

        return (
            userTotalEntries[user],
            userTotalWinnings[user],
            distributedPrizes
        );
    }

    // Get NFT pool information
    function getNFTPoolInfo() external view returns (uint256 commonCount) {
        return commonNFTPool.length;
    }

    // Returns tokenIds. To get their contract addresses, use commonNFTPoolContracts (same indices)
    function getNFTPoolTokenIds()
        external
        view
        returns (uint256[] memory tokenIds)
    {
        // Note: contract addresses are in commonNFTPoolContracts with the same indices.
        return commonNFTPool;
    }

    function getNFTPoolDetails()
        external
        view
    returns (address[] memory nftAddrs, uint256[] memory tokenIds)
    {
        return (commonNFTPoolContracts, commonNFTPool);
    }

    // This method is required by the IEntropyConsumer interface.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    // Required by IERC721Receiver
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // Receive native IP tokens for entries and entropy fees
    receive() external payable {
        // Allow receiving native IP tokens for various purposes
        // Actual entry logic is handled in enterRaffle()
    }
}
