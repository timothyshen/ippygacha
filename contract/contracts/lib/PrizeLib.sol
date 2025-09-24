// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./RandomNumberLib.sol";

library PrizeLib {
    /**
     * @dev Calculate bonus percentage based on tier
     * @param tier The prize tier (2-5)
     * @param randomNumber Source random number
     * @param offset Offset for different random values
     * @return bonusPercentage The calculated bonus percentage
     */
    function getTierBonusPercentage(
        uint8 tier,
        bytes32 randomNumber,
        uint256 offset
    ) internal pure returns (uint256 bonusPercentage) {
        if (tier == 2) {
            // Common: 10-50% bonus
            bonusPercentage = RandomNumberLib.calculateBonusPercentage(
                randomNumber,
                offset,
                10,
                50
            );
        } else if (tier == 3) {
            // Rare: 100-200% bonus
            bonusPercentage = RandomNumberLib.calculateBonusPercentage(
                randomNumber,
                offset,
                100,
                200
            );
        } else if (tier == 4) {
            // Legendary: 500-1000% bonus
            bonusPercentage = RandomNumberLib.calculateBonusPercentage(
                randomNumber,
                offset,
                500,
                1000
            );
        }
    }

    /**
     * @dev Check if tier includes NFT
     * @param tier The prize tier (2-5)
     * @return True if tier includes NFT
     */
    function tierIncludesNFT(uint8 tier) internal pure returns (bool) {
        return tier == 5; // Only tier 5 includes NFT
    }

    /**
     * @dev Calculate IP token bonus amount
     * @param entryAmount The entry amount
     * @param bonusPercentage The bonus percentage
     * @return bonusAmount The calculated bonus amount
     */
    function calculateBonusAmount(
        uint256 entryAmount,
        uint256 bonusPercentage
    ) internal pure returns (uint256 bonusAmount) {
        bonusAmount = (entryAmount * bonusPercentage) / 100;
    }
}
