// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPPYNFT is ERC721, ERC721Enumerable, Ownable {
    // Address of the BlindBox contract that can mint NFTs
    address public blindBoxContract;

    // NFT type constants (matching BlindBox contract)
    uint256 private constant TOTAL_RANGE = 1_000_000; // 1 million for precise probability

    uint256 public constant HIDDEN_NFT_ID = 0; // Ultra rare hidden NFT
    uint256 private constant HIDDEN_NFT_THRESHOLD = 1; // 1 in 1,000,000 = 0.0001%
    uint256 private constant STANDARD_NFT_RANGE = 166666; // Pre-calculated: (1000000 - 1) / 6
    uint256 public constant STANDARD_NFT_1 = 1; // Nature Theme
    uint256 public constant STANDARD_NFT_2 = 2; // Tech Theme
    uint256 public constant STANDARD_NFT_3 = 3; // Art Theme
    uint256 public constant STANDARD_NFT_4 = 4; // Music Theme
    uint256 public constant STANDARD_NFT_5 = 5; // Sports Theme
    uint256 public constant STANDARD_NFT_6 = 6; // Gaming Theme

    // Storage for actual NFT type per token (crucial for proper URI generation)
    mapping(uint256 => uint256) public tokenIdToNFTType;

    // Base URIs for different NFT types - allows individual theming
    mapping(uint256 => string) public nftTypeBaseURIs;
    string private defaultBaseURI =
        "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/";

    // Tracking for statistics
    mapping(uint256 => uint256) public nftTypeCounts; // nftType => count minted
    mapping(address => mapping(uint256 => uint256)) public userNFTTypeCounts; // user => nftType => count

    // Events for frontend tracking
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 indexed nftType,
        bool isHidden
    );
    event BaseURIUpdated(uint256 indexed nftType, string newURI);
    event DefaultBaseURIUpdated(string newURI);

    modifier onlyBlindBox() {
        require(msg.sender == blindBoxContract, "Only BlindBox can mint");
        _;
    }

    constructor() ERC721("IPPYNFT", "IPPY") Ownable(msg.sender) {
        // Initialize default base URIs for each NFT type
        nftTypeBaseURIs[
            HIDDEN_NFT_ID
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/blippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_1
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/ippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_2
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/bippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_3
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/thippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_4
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/stippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_5
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/raippy.json";
        nftTypeBaseURIs[
            STANDARD_NFT_6
        ] = "https://maroon-nearby-bedbug-535.mypinata.cloud/ipfs/bafybeibv423q2y4hnj6m7r3wuhagmi2mlmiyyexvfqhipblppnhz6mjdxq/mippy.json";
    }

    /**
     * @dev Set the BlindBox contract address (only owner can call)
     */
    function setBlindBoxContract(address _blindBoxContract) external onlyOwner {
        require(_blindBoxContract != address(0), "BlindBox contract cannot be zero address");
        blindBoxContract = _blindBoxContract;
    }

    /**
     * @dev Mint function called by BlindBox contract - now properly stores NFT type
     */
    function mint(
        address to,
        uint256 randomIndex
    ) external onlyBlindBox returns (uint256) {
        uint256 selectedNFTId;
        bool isHidden = false;

        if (randomIndex < uint256(HIDDEN_NFT_THRESHOLD)) {
            selectedNFTId = HIDDEN_NFT_ID;
            isHidden = true;
        } else {
            // Distribute among 6 standard NFTs
            uint256 adjustedIndex;
            unchecked {
                adjustedIndex = randomIndex - HIDDEN_NFT_THRESHOLD; // Safe: randomIndex >= HIDDEN_NFT_THRESHOLD
            }
            uint256 standardIndex = adjustedIndex / STANDARD_NFT_RANGE;
            if (standardIndex >= 6) standardIndex = 5; // Ensure within bounds
            unchecked {
                selectedNFTId = STANDARD_NFT_1 + standardIndex; // Safe: standardIndex <= 5, STANDARD_NFT_1 = 1
            }
        }
        uint256 newTokenId = totalSupply(); // Use sequential token IDs
        _mint(to, newTokenId);

        // Store the actual NFT type for this token (this is the key improvement)
        tokenIdToNFTType[newTokenId] = selectedNFTId;

        // Track statistics
        unchecked {
            nftTypeCounts[selectedNFTId]++; // Safe: won't realistically overflow
            userNFTTypeCounts[to][selectedNFTId]++; // Safe: won't realistically overflow
        }

        isHidden = selectedNFTId == HIDDEN_NFT_ID;
        emit NFTMinted(to, newTokenId, selectedNFTId, isHidden);
        return selectedNFTId;
    }

    /**
     * @dev Override tokenURI to provide proper metadata URLs for different NFT types
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        uint256 nftType = tokenIdToNFTType[tokenId];
        string memory baseURI = nftTypeBaseURIs[nftType];
        // For specific NFT types, return the direct metadata URL (no tokenId appending)
        return baseURI;
    }

    /**
     * @dev Get the actual stored NFT type for a token
     */
    function getNFTType(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return tokenIdToNFTType[tokenId];
    }

    /**
     * @dev Get NFT type name for display purposes
     */
    function getNFTTypeName(
        uint256 nftType
    ) external pure returns (string memory) {
        if (nftType == HIDDEN_NFT_ID) return "BLIPPY";
        if (nftType == STANDARD_NFT_1) return "IPPY";
        if (nftType == STANDARD_NFT_2) return "BIPPY";
        if (nftType == STANDARD_NFT_3) return "THIPPY";
        if (nftType == STANDARD_NFT_4) return "STIPPY";
        if (nftType == STANDARD_NFT_5) return "RAIPPY";
        if (nftType == STANDARD_NFT_6) return "MIPPY";
        return "Unknown";
    }

    /**
     * @dev Get all NFTs owned by a user with their actual types
     */
    function getUserNFTs(
        address user
    )
        external
        view
        returns (
            uint256[] memory tokenIds,
            uint256[] memory nftTypes,
            string[] memory tokenURIs,
            string[] memory typeNames
        )
    {
        uint256 balance = balanceOf(user);
        tokenIds = new uint256[](balance);
        nftTypes = new uint256[](balance);
        tokenURIs = new string[](balance);
        typeNames = new string[](balance);

        for (uint256 i; i < balance; ++i) { // ++i saves gas, no initialization needed
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            uint256 nftType = tokenIdToNFTType[tokenId];

            tokenIds[i] = tokenId;
            nftTypes[i] = nftType;
            tokenURIs[i] = tokenURI(tokenId);
            typeNames[i] = this.getNFTTypeName(nftType);
        }

        return (tokenIds, nftTypes, tokenURIs, typeNames);
    }

    /**
     * @dev Get user's NFT counts by actual type
     */
    function getUserNFTTypeCounts(
        address user
    )
        external
        view
        returns (
            uint256[] memory types,
            uint256[] memory counts,
            string[] memory typeNames
        )
    {
        types = new uint256[](7); // 0-6 types
        counts = new uint256[](7);
        typeNames = new string[](7);

        for (uint256 i; i < 7; ++i) { // ++i saves gas, no initialization needed
            types[i] = i;
            counts[i] = userNFTTypeCounts[user][i];
            typeNames[i] = this.getNFTTypeName(i);
        }

        return (types, counts, typeNames);
    }

    /**
     * @dev Get global statistics for all NFT types
     */
    function getGlobalNFTStats()
        external
        view
        returns (
            uint256[] memory types,
            uint256[] memory counts,
            string[] memory typeNames,
            uint256 totalMinted
        )
    {
        types = new uint256[](7);
        counts = new uint256[](7);
        typeNames = new string[](7);

        for (uint256 i; i < 7; ++i) { // ++i saves gas, no initialization needed
            types[i] = i;
            counts[i] = nftTypeCounts[i];
            typeNames[i] = this.getNFTTypeName(i);
        }

        return (types, counts, typeNames, totalSupply());
    }

    /**
     * @dev Check if user owns a hidden NFT
     */
    function userOwnsHiddenNFT(address user) external view returns (bool) {
        return userNFTTypeCounts[user][HIDDEN_NFT_ID] > 0;
    }

    /**
     * @dev Update base URI for a specific NFT type (only owner)
     */
    function setNFTTypeBaseURI(
        uint256 nftType,
        string calldata _baseURI
    ) external onlyOwner {
        require(nftType <= STANDARD_NFT_6, "Invalid NFT type");
        nftTypeBaseURIs[nftType] = _baseURI;
        emit BaseURIUpdated(nftType, _baseURI);
    }

    /**
     * @dev Update default base URI (only owner)
     */
    function setDefaultBaseURI(string calldata _baseURI) external onlyOwner {
        defaultBaseURI = _baseURI;
        emit DefaultBaseURIUpdated(_baseURI);
    }

    /**
     * @dev Get NFTs by type for a user
     */
    function getUserNFTsByType(
        address user,
        uint256 nftType
    ) external view returns (uint256[] memory tokenIds) {
        uint256 balance = balanceOf(user);
        uint256[] memory tempTokenIds = new uint256[](balance);
        uint256 count = 0;

        for (uint256 i; i < balance; ++i) { // ++i saves gas, no initialization needed
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (tokenIdToNFTType[tokenId] == nftType) {
                tempTokenIds[count] = tokenId;
                ++count; // ++count saves gas
            }
        }

        // Create properly sized array
        tokenIds = new uint256[](count);
        for (uint256 i; i < count; ++i) { // ++i saves gas, no initialization needed
            tokenIds[i] = tempTokenIds[i];
        }

        return tokenIds;
    }

    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Required overrides for multiple inheritance
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
