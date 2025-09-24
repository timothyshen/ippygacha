// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IOnChainRaffle {
    // Structs
    struct Entry {
        address user;
        uint256 entryCount;
        uint256 ipTokensSpent;
        uint256 timestamp;
    }

    struct Prize {
        address winner;
        uint8 tier;
        uint256 ipTokenAmount;
        uint256 nftTokenId; // 0 = no NFT, >0 = specific NFT token ID
        bool distributed;
        uint256 timestamp;
    }

    // Events
    event RaffleEntered(
        address indexed user,
        uint256 indexed entryIndex,
        uint256 entryCount,
        uint256 ipTokensSpent
    );
    event DrawRequested(address indexed user, uint64 sequenceNumber);
    event PrizeAwarded(
        address indexed winner,
        uint256 indexed prizeIndex,
        uint8 tier,
        uint256 ipTokenAmount,
        uint256 nftTokenId
    );
    event PrizeDistributed(
        address indexed winner,
        uint256 indexed prizeIndex,
        uint256 ipTokenAmount,
        uint256 nftTokenId
    );
    event RaffleStatusChanged(bool active);
    event NFTDeposited(uint256 indexed tokenId);
    event NFTWithdrawn(uint256 indexed tokenId, address to);

    // Core Functions
    function enterRaffle() external payable;

    // Admin Functions
    function depositNFTs(uint256[] calldata tokenIds) external;

    function withdrawNFT(uint256 tokenId, address to) external;

    function emergencyWithdraw() external;

    function pause() external;

    function unpause() external;

    function setRaffleStatus(bool _active) external;

    // View Functions
    function getRaffleInfo()
        external
        view
        returns (
            bool active,
            uint256 totalEntries,
            uint256 totalIPTokensCollected,
            uint256 contractBalance,
            uint256 nftPoolSize
        );

    function getUserStats(
        address user
    )
        external
        view
        returns (
            uint256 totalUserEntries,
            uint256 totalWinnings,
            uint256 distributedPrizes
        );

    function getNFTPoolInfo() external view returns (uint256 commonPoolSize);

    function getNFTPoolTokenIds() external view returns (uint256[] memory);
}
