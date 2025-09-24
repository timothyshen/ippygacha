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
import "./lib/RandomNumberLib.sol";
import "./lib/PrizeLib.sol";
import "./lib/ArrayLib.sol";

contract OnChainRaffle is
    IEntropyConsumer,
    Ownable,
    ReentrancyGuard,
    Pausable,
    IERC721Receiver,
    IOnChainRaffle
{
    IEntropyV2 public entropy;

    // NFT contract for prize distribution
    IERC721 public nftContract;

    // Raffle Configuration
    uint256 public constant ENTRY_PRICE = 0.1 ether; // 0.1 native IP tokens
    uint256 private constant GUARANTEED_RETURN_RATE = 1005; // 100.5% (1005/1000)
    uint256 private constant RATE_DENOMINATOR = 1000;

    // Raffle State
    uint256 public totalEntries;
    uint256 public totalIPTokensCollected;
    bool public raffleActive = true;

    // Prize Tiers (probability out of 10,000)
    uint256 private constant TIER_2_PROB = 100; // 1% chance for common prizes
    uint256 private constant TIER_3_PROB = 50; // 0.5% chance for rare prizes
    uint256 private constant TIER_4_PROB = 10; // 0.1% chance for legendary prizes
    uint256 private constant TIER_5_PROB = 1; // 0.01% chance for hidden jackpot

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
    uint256[] public commonNFTPool; // Token IDs for common tier prizes

    mapping(address => uint256[]) public userEntryIndices; // user => entry indices
    mapping(address => uint256[]) public userPrizeIndices; // user => prize indices
    mapping(address => uint256) public userTotalWinnings;
    mapping(address => uint256) public userTotalEntries;

    // Prize pool reserves (native IP tokens)
    uint256 public ipTokenReserve;

    // NFT management
    mapping(uint256 => bool) public availableNFTs; // tokenId => available for prizes

    constructor(address _entropy, address _nftContract) Ownable(msg.sender) {
        entropy = IEntropyV2(_entropy);
        nftContract = IERC721(_nftContract);
        raffleActive = true;
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
    function depositNFTs(uint256[] calldata tokenIds) external onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(!availableNFTs[tokenId], "NFT already deposited");

            // Transfer NFT to contract
            nftContract.transferFrom(msg.sender, address(this), tokenId);
            availableNFTs[tokenId] = true;

            // Add to appropriate tier pool
            commonNFTPool.push(tokenId);

            emit NFTDeposited(tokenId);
        }
    }

    function withdrawNFT(uint256 tokenId, address to) external onlyOwner {
        require(availableNFTs[tokenId], "NFT not available");
        require(to != address(0), "Invalid address");

        availableNFTs[tokenId] = false;
        _removeFromPools(tokenId);
        nftContract.transferFrom(address(this), to, tokenId);

        emit NFTWithdrawn(tokenId, to);
    }

    function _removeFromPools(uint256 tokenId) internal {
        _removeFromArray(commonNFTPool, tokenId);
    }

    function _removeFromArray(
        uint256[] storage array,
        uint256 tokenId
    ) internal {
        ArrayLib.removeByValue(array, tokenId);
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

    function entropyCallback(
        uint64 sequenceNumber,
        address provider,
        bytes32 randomNumber
    ) internal override {
        PendingDraw storage pendingDraw = pendingDraws[sequenceNumber];
        require(!pendingDraw.processed, "Draw already processed");
        require(pendingDraw.user != address(0), "Invalid pending draw");

        pendingDraw.processed = true;

        // Process prizes
        _processPrizes(pendingDraw.user, pendingDraw.entryAmount, randomNumber);
    }

    function _processPrizes(
        address user,
        uint256 entryAmount,
        bytes32 randomNumber
    ) internal {
        // Use library to extract tier random numbers
        (
            uint256 tier2Random,
            uint256 tier3Random,
            uint256 tier4Random,
            uint256 tier5Random
        ) = RandomNumberLib.extractTierRandomNumbers(randomNumber);

        // Check each tier using library functions
        if (RandomNumberLib.isTierWon(tier2Random, TIER_2_PROB)) {
            _createBonusPrize(user, entryAmount, 2, randomNumber, 100);
        }

        if (RandomNumberLib.isTierWon(tier3Random, TIER_3_PROB)) {
            _createBonusPrize(user, entryAmount, 3, randomNumber, 200);
        }

        if (RandomNumberLib.isTierWon(tier4Random, TIER_4_PROB)) {
            _createBonusPrize(user, entryAmount, 4, randomNumber, 300);
        }

        if (RandomNumberLib.isTierWon(tier5Random, TIER_5_PROB)) {
            _createBonusPrize(user, entryAmount, 5, randomNumber, 400);
        }
    }

    function _createBonusPrize(
        address user,
        uint256 entryAmount,
        uint8 tier,
        bytes32 randomNumber,
        uint256 offset
    ) internal {
        uint256 ipBonus = 0;
        uint256 nftTokenId = 0;

        // Use library to calculate bonus percentage
        ipBonus = PrizeLib.getTierBonusPercentage(tier, randomNumber, offset);

        // Check if tier includes NFT
        if (PrizeLib.tierIncludesNFT(tier)) {
            nftTokenId = RandomNumberLib.selectRandomNFT(
                commonNFTPool,
                randomNumber,
                offset + 100
            );
        }

        // Calculate IP token bonus using library
        uint256 ipTokenBonus = PrizeLib.calculateBonusAmount(
            entryAmount,
            ipBonus
        );

        // Immediately distribute the prize
        bool distributed = _distributePrizeImmediately(
            user,
            ipTokenBonus,
            nftTokenId
        );

        Prize memory prize = Prize({
            winner: user,
            tier: tier,
            ipTokenAmount: ipTokenBonus,
            nftTokenId: nftTokenId,
            distributed: distributed,
            timestamp: block.timestamp
        });

        uint256 prizeIndex = allPrizes.length;
        allPrizes.push(prize);
        userPrizeIndices[user].push(prizeIndex);
        userTotalWinnings[user] += ipTokenBonus;

        emit PrizeAwarded(user, prizeIndex, tier, ipTokenBonus, nftTokenId);

        if (distributed) {
            emit PrizeDistributed(user, prizeIndex, ipTokenBonus, nftTokenId);
        }
    }

    function _selectRandomNFT(
        uint256[] storage nftArray,
        bytes32 randomNumber,
        uint256 offset
    ) internal returns (uint256) {
        if (nftArray.length == 0) {
            return 0; // No NFT available
        }

        // Use a different part of the random number for NFT selection
        uint256 randomIndex = uint256(randomNumber >> (128 + offset)) %
            nftArray.length;
        uint256 selectedTokenId = nftArray[randomIndex];

        // Remove selected NFT from pool
        nftArray[randomIndex] = nftArray[nftArray.length - 1];
        nftArray.pop();

        return selectedTokenId;
    }

    // Internal function to immediately distribute prizes
    function _distributePrizeImmediately(
        address user,
        uint256 ipTokenAmount,
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
        if (nftTokenId > 0) {
            try nftContract.transferFrom(address(this), user, nftTokenId) {
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
            totalEntriesCount,
            totalIPTokensCollectedAmount,
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

    function getNFTPoolTokenIds()
        external
        view
        returns (uint256[] memory tokenIds)
    {
        return commonNFTPool;
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
