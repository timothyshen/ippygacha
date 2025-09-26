// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IIPPYNFT {
    function mint(address to, uint256 tokenId) external;
}

contract BlindBox is ERC1155, Ownable, ReentrancyGuard, IEntropyConsumer {
    using Strings for uint256;

    IIPPYNFT public ippyNFT;
    IEntropyV2 public entropy;

    string public name = "IPPY Mystery Box";
    string public symbol = "IPPY_BOX";

    // NFT IDs for the 7 different NFTs
    uint256 private constant TOTAL_RANGE = 1_000_000; // 1 million for precise probability

    // Embedded SVG for blind box (no external files needed)
    string private constant BLIND_BOX_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" width="188" height="188" viewBox="0 0 188 188" fill="none"><circle cx="94" cy="94" r="90.5" fill="url(#paint0_linear_66_5)" stroke="#634048" stroke-width="7"/><defs><linearGradient id="paint0_linear_66_5" x1="152.465" y1="2.35098e-06" x2="35.5353" y2="188" gradientUnits="userSpaceOnUse"><stop stop-color="#FEF3EF"/><stop offset="1" stop-color="#F0C0CA"/></linearGradient></defs></svg>';

    // Pricing and limits
    uint256 public boxPrice = 0.01 ether; // Price per blind box
    uint256 public maxTotalSupply = 1000000; // Max total boxes
    uint256 public currentSupply = 0; // Current minted boxes

    // VRF state management - optimized storage packing
    struct PendingBoxOpen {
        address user;        // 20 bytes
        uint128 amount;      // 16 bytes (sufficient for box amounts)
        bool processed;      // 1 byte
        // Total: 37 bytes = 2 storage slots instead of 3
    }
    mapping(uint64 => PendingBoxOpen) public pendingBoxOpens;

    // Events for frontend tracking
    event BlindBoxPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 totalCost
    );
    event BlindBoxOpened(
        address indexed opener,
        uint256 boxTokenId,
        uint256 receivedNFTId,
        bool isHidden
    );
    event PriceUpdated(uint256 newPrice);
    event NFTMinted(address indexed recipient, uint256 nftId);
    event VRFRequested(
        address indexed user,
        uint64 sequenceNumber,
        uint256 amount
    );

    constructor(
        address _ippyNFT,
        address _entropy
    ) ERC1155("") Ownable(msg.sender) {
        ippyNFT = IIPPYNFT(_ippyNFT);
        entropy = IEntropyV2(_entropy);
    }

    // Purchase blind boxes
    function purchaseBoxes(uint256 amount) external payable nonReentrant {
        require(currentSupply + amount <= maxTotalSupply, "Exceeds max supply");
        require(msg.value >= boxPrice * amount, "Insufficient payment");

        // Mint boxes to buyer (using token ID 1 for all blind boxes)
        _mint(msg.sender, 1, amount, "");
        unchecked {
            currentSupply += amount; // Safe: already checked supply limit above
        }

        emit BlindBoxPurchased(msg.sender, amount, boxPrice * amount);

        // Refund excess payment
        if (msg.value > boxPrice * amount) {
            payable(msg.sender).transfer(msg.value - (boxPrice * amount));
        }
    }

    // Open blind boxes (previous burn function renamed for clarity)
    function openBox(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender, 1) >= amount, "Insufficient boxes");

        // Calculate required entropy fee
        uint256 totalFee = entropy.getFeeV2() * amount;
        require(msg.value >= totalFee, "Insufficient fee for VRF");

        _burn(msg.sender, 1, amount);

        // Request random number for this batch
        uint64 sequenceNumber = _requestRandomNumber();

        // Store pending request
        pendingBoxOpens[sequenceNumber] = PendingBoxOpen({
            user: msg.sender,
            amount: uint128(amount), // Safe cast - box amounts won't exceed uint128
            processed: false
        });

        emit VRFRequested(msg.sender, sequenceNumber, amount);

        // Refund excess payment
        if (msg.value > totalFee) {
            payable(msg.sender).transfer(msg.value - totalFee);
        }
    }

    function _requestRandomNumber() internal returns (uint64) {
        uint256 fee = entropy.getFeeV2();
        require(
            address(this).balance >= fee,
            "Insufficient IP for entropy fee"
        );
        return entropy.requestV2{value: fee}();
    }

    function entropyCallback(
        uint64 sequenceNumber,
        address /* provider */,
        bytes32 randomNumber
    ) internal override {
        PendingBoxOpen storage pending = pendingBoxOpens[sequenceNumber];
        require(!pending.processed, "Already processed");
        require(pending.user != address(0), "Invalid sequence number");

        pending.processed = true;

        // Open multiple boxes with one random seed
        uint128 amount = pending.amount; // Cache to avoid repeated storage reads
        for (uint256 i; i < amount;) { // Remove ++i from condition for unchecked increment
            // Derive unique random number for each box
            bytes32 boxRandomNumber = keccak256(
                abi.encodePacked(randomNumber, i)
            );
            uint256 randomIndex = uint256(boxRandomNumber) % TOTAL_RANGE;

            ippyNFT.mint(pending.user, randomIndex);
            emit BlindBoxOpened(pending.user, 1, randomIndex, false);
            emit NFTMinted(pending.user, randomIndex);

            unchecked {
                ++i; // Safe: loop bound is known and reasonable
            }
        }
    }

    function mapRandomNumber(
        bytes32 randomNumber,
        int256 minRange,
        int256 maxRange
    ) internal pure returns (int256) {
        uint256 range = uint256(maxRange - minRange + 1);
        return minRange + int256(uint256(randomNumber) % range);
    }

    // Admin functions
    function setBoxPrice(uint256 _newPrice) external onlyOwner {
        boxPrice = _newPrice;
        emit PriceUpdated(_newPrice);
    }

    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setEntropy(address _entropy) external onlyOwner {
        entropy = IEntropyV2(_entropy);
    }

    function getVRFFee() external view returns (uint256) {
        return entropy.getFeeV2();
    }

    function getVRFFeeForBoxes(uint256 amount) external view returns (uint256) {
        return entropy.getFeeV2() * amount;
    }

    // Frontend helper functions
    function getUserBoxBalance(address user) external view returns (uint256) {
        return balanceOf(user, 1);
    }

    function getContractInfo()
        external
        view
        returns (
            uint256 price,
            uint256 totalSupply,
            uint256 currentSupplyCount,
            uint256 remainingBoxes
        )
    {
        return (
            boxPrice,
            maxTotalSupply,
            currentSupply,
            maxTotalSupply - currentSupply
        );
    }

    /**
     * @dev Override uri function to generate metadata on-chain
     */
    function uri(uint256 tokenId) public pure override returns (string memory) {
        if (tokenId == 1) {
            // Generate blind box metadata on-chain
            return _generateBlindBoxMetadata();
        }
        return "";
    }

    /**
     * @dev Generate blind box metadata with embedded SVG
     */
    function _generateBlindBoxMetadata() private pure returns (string memory) {
        string memory svg = BLIND_BOX_SVG;
        string memory svgBase64 = Base64.encode(bytes(svg));
        string memory imageURI = string(
            abi.encodePacked("data:image/svg+xml;base64,", svgBase64)
        );

        string memory json = string(
            abi.encodePacked(
                '{"name": "IPPY Mystery Box",',
                '"description": "A mysterious blind box containing one of 7 possible IPPY NFTs. Each box holds the potential for incredible discoveries!",',
                '"image": "',
                imageURI,
                '",',
                '"background_color": "F0C0CA",',
                '"attributes": [',
                '{"trait_type": "Type", "value": "Mystery Box"},',
                '{"trait_type": "Status", "value": "Unopened"},',
                '{"trait_type": "Hidden NFT Chance", "value": "0.0001%"},',
                '{"trait_type": "Standard NFT Chance", "value": "99.9999%"}',
                "]}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    function getIPPYNFT() external view returns (address) {
        return address(ippyNFT);
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }
}
