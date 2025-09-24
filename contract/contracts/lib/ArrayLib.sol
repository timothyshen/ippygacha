// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

library ArrayLib {
    /**
     * @dev Remove an element from an array by value
     * @param array The array to remove from
     * @param value The value to remove
     */
    function removeByValue(uint256[] storage array, uint256 value) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                // Move last element to current position and pop
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }

    /**
     * @dev Check if an array contains a value
     * @param array The array to check
     * @param value The value to look for
     * @return True if value exists in array
     */
    function contains(
        uint256[] storage array,
        uint256 value
    ) internal view returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == value) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get the length of an array
     * @param array The array
     * @return The length of the array
     */
    function length(uint256[] storage array) internal view returns (uint256) {
        return array.length;
    }

    /**
     * @dev Add a value to an array if it doesn't already exist
     * @param array The array to add to
     * @param value The value to add
     * @return True if value was added, false if it already existed
     */
    function addUnique(
        uint256[] storage array,
        uint256 value
    ) internal returns (bool) {
        if (!contains(array, value)) {
            array.push(value);
            return true;
        }
        return false;
    }
}
