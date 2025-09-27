# NFT Template System

This directory contains a flexible NFT template system that makes it easy to deploy multiple NFT collections with different configurations.

## 📁 Files Overview

- **`NFTTemplate.sol`** - The main template contract that can be configured for different NFT collections
- **`NFTFactory.sol`** - Factory contract for deploying multiple NFT instances
- **`deployNFTTemplate.ts`** - Script to deploy individual NFT collections
- **`deployFactory.ts`** - Script to deploy the factory contract
- **`MetadataLib.sol`** - Library for handling NFT metadata (shared across all collections)

## 🚀 Quick Start

### Option 1: Deploy Individual Collections

```bash
# Deploy with predefined configuration
NFT_CONFIG=ippy pnpm hardhat run scripts/deployNFTTemplate.ts --network <network>

# Available configurations: ippy, rare, common, standard, gaming
```

### Option 2: Deploy Factory (Recommended)

```bash
# Deploy the factory contract
pnpm hardhat run scripts/deployFactory.ts --network <network>

# Then use the factory to deploy multiple collections
```

## 🎯 Predefined Configurations

| Config | Name | Symbol | Total Range | Hidden Threshold | Standard NFTs | Hidden NFT Chance |
|--------|------|--------|-------------|------------------|---------------|-------------------|
| `ippy` | IPPYNFT | IPPY | 777,777 | 1,000 | 6 | ~0.13% |
| `rare` | RareNFT | RARE | 1,000,000 | 100 | 5 | 0.01% |
| `common` | CommonNFT | COMMON | 100,000 | 10,000 | 4 | 10% |
| `standard` | StandardNFT | STD | 600,000 | 0 | 6 | 0% (disabled) |
| `gaming` | GameNFT | GAME | 1,000,000 | 5,000 | 6 | 0.5% |

## 🔧 Custom Configuration

You can deploy with custom parameters:

```typescript
import { deployCustomNFT } from "./scripts/deployNFTTemplate";

const nftAddress = await deployCustomNFT(
  "MyCollection",    // Name
  "MYNFT",          // Symbol
  1000000,          // Total range
  5000,             // Hidden threshold (0 to disable)
  6,                // Number of standard NFTs
  ownerAddress      // Owner
);
```

## 🏭 Using the Factory

```typescript
// Deploy factory
const factory = await ethers.getContractAt("NFTFactory", factoryAddress);

// Deploy predefined collection
await factory.deployPredefinedCollection("ippy", ownerAddress);

// Deploy custom collection
await factory.deployNFTCollection(
  "CustomNFT",
  "CNFT", 
  1000000,
  1000,
  6,
  ownerAddress
);

// Get all deployed collections
const allNFTs = await factory.getAllDeployedNFTs();
```

## 📊 NFT Types and Metadata

All collections use the same metadata system with these NFT types:

- **Type 0**: BLIPPY (Hidden NFT) - "The elusive Blippy, rumored to bend probability itself."
- **Type 1**: IPPY (Nature) - "IPPY thrives in lush forests, bringing calm to every grove."
- **Type 2**: BIPPY (Tech) - "BIPPY pulses with neon energy from future cityscapes."
- **Type 3**: THIPPY (Art) - "THIPPY paints reality with bold strokes and endless vision."
- **Type 4**: STIPPY (Music) - "STIPPY harmonizes soundwaves into luminous melodies."
- **Type 5**: RAIPPY (Sports) - "RAIPPY sprints past rivals, chasing the next arena victory."
- **Type 6**: MIPPY (Gaming) - "MIPPY levels up faster than any challenger in the arcade."

## 🔄 Configuration Updates

After deployment, you can update the configuration (only owner):

```typescript
const nft = await ethers.getContractAt("NFTTemplate", nftAddress);

await nft.updateConfig(
  1000000,  // New total range
  5000,     // New hidden threshold
  6         // New number of standard NFTs
);
```

## 📈 Key Features

- **Configurable Probabilities**: Set different rarity levels for each collection
- **Flexible NFT Types**: Support 1-6 standard NFT types
- **Optional Hidden NFT**: Enable/disable hidden NFT with custom probability
- **Statistics Tracking**: Built-in tracking for minted NFTs and user collections
- **Metadata Integration**: Automatic metadata generation using MetadataLib
- **Factory Pattern**: Easy deployment of multiple collections
- **Owner Controls**: Update configurations after deployment

## 🎲 Probability Calculation

The probability system works as follows:

1. **Hidden NFT**: `hiddenThreshold / totalRange * 100%`
2. **Each Standard NFT**: `(totalRange - hiddenThreshold) / numStandardNFTs / totalRange * 100%`

Example for IPPY configuration:
- Hidden NFT: `1000 / 777777 * 100% = 0.1286%`
- Each Standard NFT: `(777777 - 1000) / 6 / 777777 * 100% = 16.6452%`

## 🔐 Security Features

- **Access Control**: Only BlindBox contract can mint NFTs
- **Owner Controls**: Only owner can update configurations
- **Bounds Checking**: All array operations are bounds-checked
- **Safe Math**: Uses unchecked arithmetic where safe

## 🧪 Testing

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to local network
pnpm hardhat node
pnpm hardhat run scripts/deployFactory.ts --network localhost
```

## 📝 Deployment Checklist

- [ ] Choose configuration (predefined or custom)
- [ ] Set owner address
- [ ] Deploy contract or factory
- [ ] Set BlindBox contract address
- [ ] Test minting functionality
- [ ] Verify metadata generation
- [ ] Update frontend integration

## 🤝 Integration

The template integrates seamlessly with:
- **BlindBox Contract**: For minting NFTs
- **MetadataLib**: For consistent metadata across collections
- **Frontend**: Standard ERC721 interface with additional utility functions

## 📞 Support

For questions or issues with the template system, please refer to the main project documentation or create an issue in the repository.

