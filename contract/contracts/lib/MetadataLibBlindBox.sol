// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library MetadataLibBlindBox {
    using Strings for uint256;

    // Embedded SVG for blind box (no external files needed)
    string private constant BLIND_BOX_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" width="188" height="188" viewBox="0 0 188 188" fill="none"><circle cx="94" cy="94" r="90.5" fill="url(#paint0_linear_66_5)" stroke="#634048" stroke-width="7"/><defs><linearGradient id="paint0_linear_66_5" x1="152.465" y1="2.35098e-06" x2="35.5353" y2="188" gradientUnits="userSpaceOnUse"><stop stop-color="#FEF3EF"/><stop offset="1" stop-color="#F0C0CA"/></linearGradient></defs></svg>';

    /**
     * @dev Generate blind box metadata with embedded SVG
     */
    function generateBlindBoxMetadata() public pure returns (string memory) {
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

    /**
     * @dev Generate URI for blind box token
     */
    function tokenURI(uint256 tokenId) public pure returns (string memory) {
        if (tokenId == 1) {
            // Generate blind box metadata on-chain
            return generateBlindBoxMetadata();
        }
        return "";
    }
}
