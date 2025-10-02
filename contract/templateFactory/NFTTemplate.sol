// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./lib/MetadataLib.sol";

/**
 * @title NFTTemplate
 * @dev A configurable NFT contract template for easy deployment
 * @notice This contract can be deployed with custom parameters for different NFT collections
 */
contract NFTTemplate is ERC721, ERC721Enumerable, Ownable {
    // Configuration parameters set at deployment
    struct NFTConfig {
        string name;           // Collection name
        string symbol;         // Collection symbol
        uint256 totalRange;    // Total probability range
        uint256 hiddenThreshold; // Threshold for hidden NFT (0 = disabled)
        uint256 standardRange; // Range for each standard NFT
        uint256 numStandardNFTs; // Number of standard NFT types
        bool hasHiddenNFT;     // Whether hidden NFT is enabled
    }

    NFTConfig public config;
    
    // Address of the BlindBox contract that can mint NFTs
    address public blindBoxContract;

    // Storage for actual NFT type per token (crucial for proper URI generation)
    mapping(uint256 => uint256) public tokenIdToNFTType;

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

    event ConfigUpdated(
        uint256 totalRange,
        uint256 hiddenThreshold,
        uint256 standardRange,
        uint256 numStandardNFTs,
        bool hasHiddenNFT
    );

    modifier onlyBlindBox() {
        require(msg.sender == blindBoxContract, "Only BlindBox can mint");
        _;
    }

    /**
     * @dev Constructor with configurable parameters
     * @param _name Collection name
     * @param _symbol Collection symbol
     * @param _totalRange Total probability range (e.g., 777777)
     * @param _hiddenThreshold Threshold for hidden NFT (0 to disable)
     * @param _numStandardNFTs Number of standard NFT types (1-6)
     * @param _owner Owner address
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalRange,
        uint256 _hiddenThreshold,
        uint256 _numStandardNFTs,
        address _owner
    ) ERC721(_name, _symbol) Ownable(_owner) {
        require(_numStandardNFTs > 0 && _numStandardNFTs <= 6, "Invalid number of standard NFTs");
        require(_totalRange > 0, "Total range must be positive");
        
        bool hasHidden = _hiddenThreshold > 0;
        uint256 standardRange = hasHidden 
            ? (_totalRange - _hiddenThreshold) / _numStandardNFTs
            : _totalRange / _numStandardNFTs;

        config = NFTConfig({
            name: _name,
            symbol: _symbol,
            totalRange: _totalRange,
            hiddenThreshold: _hiddenThreshold,
            standardRange: standardRange,
            numStandardNFTs: _numStandardNFTs,
            hasHiddenNFT: hasHidden
        });

        emit ConfigUpdated(
            _totalRange,
            _hiddenThreshold,
            standardRange,
            _numStandardNFTs,
            hasHidden
        );
    }

    /**
     * @dev Set the BlindBox contract address (only owner can call)
     */
    function setBlindBoxContract(address _blindBoxContract) external onlyOwner {
        require(_blindBoxContract != address(0), "BlindBox contract cannot be zero address");
        blindBoxContract = _blindBoxContract;
    }

    /**
     * @dev Update configuration (only owner can call)
     * @notice This allows changing probabilities after deployment
     */
    function updateConfig(
        uint256 _totalRange,
        uint256 _hiddenThreshold,
        uint256 _numStandardNFTs
    ) external onlyOwner {
        require(_numStandardNFTs > 0 && _numStandardNFTs <= 6, "Invalid number of standard NFTs");
        require(_totalRange > 0, "Total range must be positive");
        
        bool hasHidden = _hiddenThreshold > 0;
        uint256 standardRange = hasHidden 
            ? (_totalRange - _hiddenThreshold) / _numStandardNFTs
            : _totalRange / _numStandardNFTs;

        config.totalRange = _totalRange;
        config.hiddenThreshold = _hiddenThreshold;
        config.standardRange = standardRange;
        config.numStandardNFTs = _numStandardNFTs;
        config.hasHiddenNFT = hasHidden;

        emit ConfigUpdated(
            _totalRange,
            _hiddenThreshold,
            standardRange,
            _numStandardNFTs,
            hasHidden
        );
    }

    /**
     * @dev Mint function called by BlindBox contract
     */
    function mint(
        address to,
        uint256 randomIndex
    ) external onlyBlindBox returns (uint256) {
        uint256 selectedNFTId;
        bool isHidden = false;

        if (config.hasHiddenNFT && randomIndex < config.hiddenThreshold) {
            selectedNFTId = 0; // Hidden NFT ID
            isHidden = true;
        } else {
            // Distribute among standard NFTs
            uint256 adjustedIndex = config.hasHiddenNFT 
                ? randomIndex - config.hiddenThreshold
                : randomIndex;
            
            uint256 standardIndex = adjustedIndex / config.standardRange;
            if (standardIndex >= config.numStandardNFTs) {
                standardIndex = config.numStandardNFTs - 1; // Ensure within bounds
            }
            
            selectedNFTId = config.hasHiddenNFT ? standardIndex + 1 : standardIndex;
        }

        uint256 newTokenId = totalSupply(); // Use sequential token IDs
        _mint(to, newTokenId);

        // Store the actual NFT type for this token
        tokenIdToNFTType[newTokenId] = selectedNFTId;

        // Track statistics
        unchecked {
            nftTypeCounts[selectedNFTId]++; // Safe: won't realistically overflow
            userNFTTypeCounts[to][selectedNFTId]++; // Safe: won't realistically overflow
        }

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
        return MetadataLib.tokenURI(uint8(nftType), tokenId);
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
        return MetadataLib.getNFTTypeName(uint8(nftType));
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

        for (uint256 i; i < balance; ++i) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            uint256 nftType = tokenIdToNFTType[tokenId];

            tokenIds[i] = tokenId;
            nftTypes[i] = nftType;
            tokenURIs[i] = tokenURI(tokenId);
            typeNames[i] = MetadataLib.getNFTTypeName(uint8(nftType));
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
        uint256 totalTypes = config.hasHiddenNFT ? config.numStandardNFTs + 1 : config.numStandardNFTs;
        types = new uint256[](totalTypes);
        counts = new uint256[](totalTypes);
        typeNames = new string[](totalTypes);

        for (uint256 i; i < totalTypes; ++i) {
            types[i] = i;
            counts[i] = userNFTTypeCounts[user][i];
            typeNames[i] = MetadataLib.getNFTTypeName(uint8(i));
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
        uint256 totalTypes = config.hasHiddenNFT ? config.numStandardNFTs + 1 : config.numStandardNFTs;
        types = new uint256[](totalTypes);
        counts = new uint256[](totalTypes);
        typeNames = new string[](totalTypes);

        for (uint256 i; i < totalTypes; ++i) {
            types[i] = i;
            counts[i] = nftTypeCounts[i];
            typeNames[i] = MetadataLib.getNFTTypeName(uint8(i));
        }

        return (types, counts, typeNames, totalSupply());
    }

    /**
     * @dev Check if user owns a hidden NFT
     */
    function userOwnsHiddenNFT(address user) external view returns (bool) {
        return config.hasHiddenNFT && userNFTTypeCounts[user][0] > 0;
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

        for (uint256 i; i < balance; ++i) {
            uint256 tokenId = tokenOfOwnerByIndex(user, i);
            if (tokenIdToNFTType[tokenId] == nftType) {
                tempTokenIds[count] = tokenId;
                ++count;
            }
        }

        // Create properly sized array
        tokenIds = new uint256[](count);
        for (uint256 i; i < count; ++i) {
            tokenIds[i] = tempTokenIds[i];
        }

        return tokenIds;
    }

    /**
     * @dev Get current configuration
     */
    function getConfig() external view returns (NFTConfig memory) {
        return config;
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
