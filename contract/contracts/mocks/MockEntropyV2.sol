// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract MockEntropyV2 is IEntropyV2 {
    uint256 public fee;
    uint64 public sequenceCounter;
    mapping(uint64 => bool) public processedCallbacks;
    mapping(uint64 => address) public requestConsumers; // Track which address made each request

    constructor() {
        fee = 0.001 ether;
        sequenceCounter = 0;
    }

    function setFee(uint256 _fee) external {
        fee = _fee;
    }

    function getFeeV2() external view override returns (uint128) {
        return uint128(fee);
    }

    function requestV2() external payable override returns (uint64) {
        require(msg.value >= fee, "Insufficient fee");
        uint64 sequenceNumber = sequenceCounter;
        requestConsumers[sequenceNumber] = msg.sender; // Store the consumer address
        sequenceCounter++;
        return sequenceNumber;
    }

    /**
     * @notice Fulfill a request with a specific random number (for testing)
     * @param sequenceNumber The sequence number to fulfill
     * @param randomNumber The random number to provide
     */
    function fulfillRequest(uint64 sequenceNumber, bytes32 randomNumber) external {
        require(requestConsumers[sequenceNumber] != address(0), "Request does not exist");
        require(!processedCallbacks[sequenceNumber], "Already processed");

        processedCallbacks[sequenceNumber] = true;
        address consumer = requestConsumers[sequenceNumber];

        // Call _entropyCallback which is the public callback method
        IEntropyConsumer(consumer)._entropyCallback(
            sequenceNumber,
            address(this), // provider
            randomNumber
        );
    }

    /**
     * @notice Batch fulfill multiple requests (for testing)
     */
    function fulfillBatch(
        uint64[] calldata sequenceNumbers,
        bytes32[] calldata randomNumbers
    ) external {
        require(sequenceNumbers.length == randomNumbers.length, "Length mismatch");

        for (uint256 i = 0; i < sequenceNumbers.length; i++) {
            this.fulfillRequest(sequenceNumbers[i], randomNumbers[i]);
        }
    }

    /**
     * @notice Generate a random number that will result in a specific outcome
     * @param targetPpm The target PPM value (0-1,000,000)
     */
    function generateRandomForOutcome(uint256 targetPpm) external pure returns (bytes32) {
        return bytes32(targetPpm);
    }

    /**
     * @notice Helper to calculate what outcome a random number will produce
     */
    function predictOutcome(bytes32 randomNumber) external pure returns (uint256 ppm) {
        return uint256(randomNumber) % 1_000_000;
    }

    function simulateCallback(
        uint64 sequenceNumber,
        bytes32 randomNumber
    ) external {
        require(!processedCallbacks[sequenceNumber], "Already processed");
        processedCallbacks[sequenceNumber] = true;

        // Simulate the entropy callback by calling the consumer contract
        // This is a simplified version for testing
        address consumer = msg.sender;
        (bool success, ) = consumer.call(
            abi.encodeWithSignature(
                "entropyCallback(uint64,address,bytes32)",
                sequenceNumber,
                address(this),
                randomNumber
            )
        );
        require(success, "Callback failed");
    }

    // Required interface functions (not used in tests)
    function requestV2(
        uint32 gasLimit
    ) external payable override returns (uint64) {
        return _requestV2Internal();
    }

    function requestV2(
        address provider,
        uint32 gasLimit
    ) external payable override returns (uint64) {
        return _requestV2Internal();
    }

    function requestV2(
        address provider,
        bytes32 userRandomNumber,
        uint32 gasLimit
    ) external payable override returns (uint64) {
        return _requestV2Internal();
    }

    function _requestV2Internal() internal returns (uint64) {
        require(msg.value >= fee, "Insufficient fee");
        uint64 sequenceNumber = sequenceCounter;
        requestConsumers[sequenceNumber] = msg.sender; // Store the consumer address
        sequenceCounter++;
        return sequenceNumber;
    }

    function getProviderInfoV2(
        address provider
    ) external view override returns (EntropyStructsV2.ProviderInfo memory) {
        revert("Not implemented in mock");
    }

    function getDefaultProvider() external view override returns (address) {
        return address(this);
    }

    function getRequestV2(
        address provider,
        uint64 sequenceNumber
    ) external view override returns (EntropyStructsV2.Request memory) {
        revert("Not implemented in mock");
    }

    function getFeeV2(
        uint32 gasLimit
    ) external view override returns (uint128) {
        return uint128(fee);
    }

    function getFeeV2(
        address provider,
        uint32 gasLimit
    ) external view override returns (uint128) {
        return uint128(fee);
    }
}
