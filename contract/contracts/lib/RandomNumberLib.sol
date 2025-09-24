// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

library RandomNumberLib {
    /**
     * @dev Extract tier random numbers from a single random number
     * @param randomNumber The source random number
     * @return tier2Random Random number for tier 2 (0-9999)
     * @return tier3Random Random number for tier 3 (0-9999)
     * @return tier4Random Random number for tier 4 (0-9999)
     * @return tier5Random Random number for tier 5 (0-9999)
     */
    function extractTierRandomNumbers(
        bytes32 randomNumber
    )
        internal
        pure
        returns (
            uint256 tier2Random,
            uint256 tier3Random,
            uint256 tier4Random,
            uint256 tier5Random
        )
    {
        // Use different bytes of the same random number for each tier
        tier2Random = uint256(randomNumber) % 10000;
        tier3Random = uint256(randomNumber >> 16) % 10000;
        tier4Random = uint256(randomNumber >> 32) % 10000;
        tier5Random = uint256(randomNumber >> 48) % 10000;
    }

    /**
     * @dev Check if a tier is won based on random number and probability
     * @param tierRandom The random number for the tier (0-9999)
     * @param probability The probability threshold (0-10000)
     * @return True if tier is won
     */
    function isTierWon(
        uint256 tierRandom,
        uint256 probability
    ) internal pure returns (bool) {
        return tierRandom < probability;
    }

    /**
     * @dev Generate bonus percentage within a range
     * @param randomNumber Source random number
     * @param offset Offset for different random values
     * @param minBonus Minimum bonus percentage
     * @param maxBonus Maximum bonus percentage
     * @return bonusPercentage The calculated bonus percentage
     */
    function calculateBonusPercentage(
        bytes32 randomNumber,
        uint256 offset,
        uint256 minBonus,
        uint256 maxBonus
    ) internal pure returns (uint256 bonusPercentage) {
        uint256 bonusRandom = uint256(randomNumber >> (64 + offset)) % 100;
        uint256 range = maxBonus - minBonus;
        bonusPercentage = minBonus + ((bonusRandom * range) / 100);
    }

    /**
     * @dev Select a random NFT from a pool
     * @param nftPool Array of available NFT token IDs
     * @param randomNumber Source random number
     * @param offset Offset for different random values
     * @return tokenId The selected NFT token ID, or 0 if pool is empty
     */
    function selectRandomNFT(
        uint256[] storage nftPool,
        bytes32 randomNumber,
        uint256 offset
    ) internal view returns (uint256 tokenId) {
        if (nftPool.length == 0) {
            return 0;
        }

        uint256 randomIndex = uint256(randomNumber >> offset) % nftPool.length;
        tokenId = nftPool[randomIndex];
    }
}
