// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTTemplate.sol";

/**
 * @title NFTFactory
 * @dev Factory contract for deploying NFTTemplate instances
 * @notice This contract allows easy deployment of multiple NFT collections
 */
contract NFTFactory {
    // Array to store all deployed NFT contracts
    address[] public deployedNFTs;
    
    // Mapping to track NFT collections by name
    mapping(string => address) public nftCollections;
    
    // Events
    event NFTCollectionDeployed(
        string indexed name,
        string indexed symbol,
        address indexed nftAddress,
        address deployer
    );

    /**
     * @dev Deploy a new NFT collection
     * @param name Collection name
     * @param symbol Collection symbol
     * @param totalRange Total probability range
     * @param hiddenThreshold Threshold for hidden NFT (0 to disable)
     * @param numStandardNFTs Number of standard NFT types (1-6)
     * @param owner Owner address for the new NFT contract
     * @return nftAddress Address of the deployed NFT contract
     */
    function deployNFTCollection(
        string memory name,
        string memory symbol,
        uint256 totalRange,
        uint256 hiddenThreshold,
        uint256 numStandardNFTs,
        address owner
    ) external returns (address nftAddress) {
        // Deploy new NFTTemplate
        NFTTemplate newNFT = new NFTTemplate(
            name,
            symbol,
            totalRange,
            hiddenThreshold,
            numStandardNFTs,
            owner
        );
        
        nftAddress = address(newNFT);
        
        // Store the deployment
        deployedNFTs.push(nftAddress);
        nftCollections[name] = nftAddress;
        
        emit NFTCollectionDeployed(name, symbol, nftAddress, msg.sender);
        
        return nftAddress;
    }

    /**
     * @dev Deploy a new NFT collection with predefined configurations
     * @param configType Type of configuration to use
     * @param owner Owner address for the new NFT contract
     * @return nftAddress Address of the deployed NFT contract
     */
    function deployPredefinedCollection(
        string memory configType,
        address owner
    ) external returns (address nftAddress) {
        if (keccak256(bytes(configType)) == keccak256(bytes("ippy"))) {
            return deployNFTCollection(
                "IPPYNFT",
                "IPPY",
                777777,
                1000,
                6,
                owner
            );
        } else if (keccak256(bytes(configType)) == keccak256(bytes("rare"))) {
            return deployNFTCollection(
                "RareNFT",
                "RARE",
                1000000,
                100,
                5,
                owner
            );
        } else if (keccak256(bytes(configType)) == keccak256(bytes("common"))) {
            return deployNFTCollection(
                "CommonNFT",
                "COMMON",
                100000,
                10000,
                4,
                owner
            );
        } else if (keccak256(bytes(configType)) == keccak256(bytes("standard"))) {
            return deployNFTCollection(
                "StandardNFT",
                "STD",
                600000,
                0,
                6,
                owner
            );
        } else if (keccak256(bytes(configType)) == keccak256(bytes("gaming"))) {
            return deployNFTCollection(
                "GameNFT",
                "GAME",
                1000000,
                5000,
                6,
                owner
            );
        } else {
            revert("Unknown configuration type");
        }
    }

    /**
     * @dev Get all deployed NFT contracts
     * @return Array of NFT contract addresses
     */
    function getAllDeployedNFTs() external view returns (address[] memory) {
        return deployedNFTs;
    }

    /**
     * @dev Get the number of deployed NFT contracts
     * @return Number of deployed contracts
     */
    function getDeployedCount() external view returns (uint256) {
        return deployedNFTs.length;
    }

    /**
     * @dev Get NFT contract address by name
     * @param name Collection name
     * @return NFT contract address (address(0) if not found)
     */
    function getNFTByName(string memory name) external view returns (address) {
        return nftCollections[name];
    }

    /**
     * @dev Check if a collection name is already used
     * @param name Collection name to check
     * @return True if name is already used
     */
    function isNameUsed(string memory name) external view returns (bool) {
        return nftCollections[name] != address(0);
    }
}
