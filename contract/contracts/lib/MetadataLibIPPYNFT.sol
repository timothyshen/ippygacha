// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library MetadataLibIPPYNFT {
    using Strings for uint256;

    uint8 public constant HIDDEN_NFT_ID = 0;
    uint8 public constant STANDARD_NFT_1 = 1;
    uint8 public constant STANDARD_NFT_2 = 2;
    uint8 public constant STANDARD_NFT_3 = 3;
    uint8 public constant STANDARD_NFT_4 = 4;
    uint8 public constant STANDARD_NFT_5 = 5;
    uint8 public constant STANDARD_NFT_6 = 6;
    struct NFTData {
        string name;
        string description;
        string imageURI;
        string power;
        string theme;
    }

    function _getNFTData(uint8 nftType) private pure returns (NFTData memory) {
        if (nftType == HIDDEN_NFT_ID) {
            return
                NFTData({
                    name: "BLIPPY",
                    description: "The elusive Blippy, rumored to bend probability itself.",
                    imageURI: "ipfs://bafybeighheaaipvzi5ixs7rc7we3nzffkxqcmkg2dwlky76met5uwsxzoe",
                    power: "Mythic Burst",
                    theme: "Mystery"
                });
        }
        if (nftType == STANDARD_NFT_1) {
            return
                NFTData({
                    name: "IPPY",
                    description: "IPPY thrives in lush forests, bringing calm to every grove.",
                    imageURI: "ipfs://bafybeiad5nptvwmhcgiw5j3fbolenjq2rku4ngpfjmrqf4qbky2keffima",
                    power: "Verdant Aura",
                    theme: "Nature"
                });
        }
        if (nftType == STANDARD_NFT_2) {
            return
                NFTData({
                    name: "BIPPY",
                    description: "BIPPY pulses with neon energy from future cityscapes.",
                    imageURI: "ipfs://bafybeihi364i5re757do7h3nuctmg767kxbq6bf5uwasqz2z4wogjuxrz4",
                    power: "Quantum Pulse",
                    theme: "Tech"
                });
        }
        if (nftType == STANDARD_NFT_3) {
            return
                NFTData({
                    name: "THIPPY",
                    description: "THIPPY paints reality with bold strokes and endless vision.",
                    imageURI: "ipfs://bafybeigcqs5mthsztjwni72r2db6z4h4wbbzsr5ssb5pprks26f2ovejki",
                    power: "Chromatic Wave",
                    theme: "Art"
                });
        }
        if (nftType == STANDARD_NFT_4) {
            return
                NFTData({
                    name: "STIPPY",
                    description: "STIPPY harmonizes soundwaves into luminous melodies.",
                    imageURI: "ipfs://bafybeiarewwweril6gs3req2ngofpbxqrbc5lk2zzy3fs2a5zp2szufxui",
                    power: "Resonant Echo",
                    theme: "Music"
                });
        }
        if (nftType == STANDARD_NFT_5) {
            return
                NFTData({
                    name: "RAIPPY",
                    description: "RAIPPY sprints past rivals, chasing the next arena victory.",
                    imageURI: "ipfs://bafkreihgk4x54g54rfcvik3jde2wo6lcfimrvazaowak55kan6ipi7od5a",
                    power: "Champion's Drive",
                    theme: "Sports"
                });
        }
        if (nftType == STANDARD_NFT_6) {
            return
                NFTData({
                    name: "MIPPY",
                    description: "MIPPY levels up faster than any challenger in the arcade.",
                    imageURI: "ipfs://bafybeihi64lzamykvhgsexnhuh5tvlirvvilgak7v3mh27v75kvkulxqia",
                    power: "Arcade Surge",
                    theme: "Gaming"
                });
        }
        // Default case for unknown types
        return
            NFTData({
                name: "Unknown",
                description: "Unknown IPPY entity.",
                imageURI: "",
                power: "Undefined",
                theme: "Mystery"
            });
    }

    function tokenURI(
        uint8 nftType,
        uint256 tokenId,
        bool isRedeemed
    ) internal pure returns (string memory) {
        NFTData memory nftData = _getNFTData(nftType);
        string memory attributes = _attributes(nftType);

        string memory json = string.concat(
            '{"name":"',
            nftData.name,
            " #",
            tokenId.toString(),
            '","description":"',
            nftData.description,
            '","image":"',
            nftData.imageURI,
            '","status":"',
            isRedeemed ? "Redeemed" : "Unredeemed",
            '","attributes":[',
            attributes,
            "]}"
        );

        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            );
    }

    function getNFTTypeName(
        uint8 nftType
    ) internal pure returns (string memory) {
        return _getNFTData(nftType).name;
    }

    function _attributes(uint8 nftType) private pure returns (string memory) {
        NFTData memory nftData = _getNFTData(nftType);

        if (nftType == HIDDEN_NFT_ID) {
            return
                '{"trait_type":"Tier","value":"Hidden"},{"trait_type":"Affinity","value":"Mystery"},{"trait_type":"Power","value":"Legendary Beam"}';
        }

        return
            string.concat(
                '{"trait_type":"Tier","value":"Standard"},{"trait_type":"Affinity","value":"',
                nftData.theme,
                '"},{"trait_type":"Power","value":"',
                nftData.power,
                '"}'
            );
    }
}
