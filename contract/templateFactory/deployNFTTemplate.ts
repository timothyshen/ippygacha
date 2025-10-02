import { ethers } from "hardhat";

/**
 * Deployment script for NFTTemplate
 * This script makes it easy to deploy NFT collections with different configurations
 */

interface NFTConfig {
  name: string;
  symbol: string;
  totalRange: number;
  hiddenThreshold: number;
  numStandardNFTs: number;
  description: string;
}

// Predefined configurations for different NFT collections
const NFT_CONFIGS: Record<string, NFTConfig> = {
  // Original IPPY configuration
  ippy: {
    name: "IPPYNFT",
    symbol: "IPPY",
    totalRange: 777777,
    hiddenThreshold: 1000, // ~0.13% chance
    numStandardNFTs: 6,
    description: "Original IPPY collection with 6 standard NFTs and 1 hidden NFT"
  },

  // High rarity collection (very rare hidden NFT)
  rare: {
    name: "RareNFT",
    symbol: "RARE",
    totalRange: 1000000,
    hiddenThreshold: 100, // 0.01% chance
    numStandardNFTs: 5,
    description: "High rarity collection with very rare hidden NFT"
  },

  // Common collection (more common hidden NFT)
  common: {
    name: "CommonNFT",
    symbol: "COMMON",
    totalRange: 100000,
    hiddenThreshold: 10000, // 10% chance
    numStandardNFTs: 4,
    description: "Common collection with frequent hidden NFT"
  },

  // No hidden NFT collection
  standard: {
    name: "StandardNFT",
    symbol: "STD",
    totalRange: 600000,
    hiddenThreshold: 0, // No hidden NFT
    numStandardNFTs: 6,
    description: "Standard collection with no hidden NFT"
  },

  // Gaming collection
  gaming: {
    name: "GameNFT",
    symbol: "GAME",
    totalRange: 1000000,
    hiddenThreshold: 5000, // 0.5% chance
    numStandardNFTs: 6,
    description: "Gaming-themed collection with 6 character types"
  }
};

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying NFTTemplate with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Get configuration from command line or use default
  const configName = process.env.NFT_CONFIG || "ippy";
  const config = NFT_CONFIGS[configName];
  
  if (!config) {
    console.error(`Configuration '${configName}' not found. Available configs:`, Object.keys(NFT_CONFIGS));
    process.exit(1);
  }

  console.log(`\nDeploying with configuration: ${configName}`);
  console.log(`Name: ${config.name}`);
  console.log(`Symbol: ${config.symbol}`);
  console.log(`Total Range: ${config.totalRange}`);
  console.log(`Hidden Threshold: ${config.hiddenThreshold}`);
  console.log(`Number of Standard NFTs: ${config.numStandardNFTs}`);
  console.log(`Description: ${config.description}`);

  // Deploy the NFTTemplate contract
  const NFTTemplate = await ethers.getContractFactory("NFTTemplate");
  const nftContract = await NFTTemplate.deploy(
    config.name,
    config.symbol,
    config.totalRange,
    config.hiddenThreshold,
    config.numStandardNFTs,
    deployer.address // Owner
  );

  await nftContract.waitForDeployment();
  const contractAddress = await nftContract.getAddress();

  console.log(`\n✅ NFTTemplate deployed successfully!`);
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Owner: ${deployer.address}`);

  // Verify the configuration
  const deployedConfig = await nftContract.getConfig();
  console.log(`\n📋 Deployed Configuration:`);
  console.log(`- Name: ${deployedConfig.name}`);
  console.log(`- Symbol: ${deployedConfig.symbol}`);
  console.log(`- Total Range: ${deployedConfig.totalRange.toString()}`);
  console.log(`- Hidden Threshold: ${deployedConfig.hiddenThreshold.toString()}`);
  console.log(`- Standard Range: ${deployedConfig.standardRange.toString()}`);
  console.log(`- Number of Standard NFTs: ${deployedConfig.numStandardNFTs.toString()}`);
  console.log(`- Has Hidden NFT: ${deployedConfig.hasHiddenNFT}`);

  // Calculate probabilities
  const hiddenProbability = config.hiddenThreshold > 0 
    ? (config.hiddenThreshold / config.totalRange * 100).toFixed(4)
    : "0";
  const standardProbability = config.hiddenThreshold > 0
    ? ((config.totalRange - config.hiddenThreshold) / config.numStandardNFTs / config.totalRange * 100).toFixed(4)
    : (100 / config.numStandardNFTs).toFixed(4);

  console.log(`\n🎲 Probability Analysis:`);
  if (config.hiddenThreshold > 0) {
    console.log(`- Hidden NFT: ${hiddenProbability}%`);
  }
  console.log(`- Each Standard NFT: ${standardProbability}%`);

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    configName,
    config,
    deployedConfig: {
      name: deployedConfig.name,
      symbol: deployedConfig.symbol,
      totalRange: deployedConfig.totalRange.toString(),
      hiddenThreshold: deployedConfig.hiddenThreshold.toString(),
      standardRange: deployedConfig.standardRange.toString(),
      numStandardNFTs: deployedConfig.numStandardNFTs.toString(),
      hasHiddenNFT: deployedConfig.hasHiddenNFT
    },
    probabilities: {
      hidden: hiddenProbability,
      standard: standardProbability
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log(`\n💾 Deployment info saved to deployment-info.json`);
  
  // You can save this to a file if needed
  // fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

// Helper function to deploy with custom parameters
export async function deployCustomNFT(
  name: string,
  symbol: string,
  totalRange: number,
  hiddenThreshold: number,
  numStandardNFTs: number,
  owner: string
) {
  const NFTTemplate = await ethers.getContractFactory("NFTTemplate");
  const nftContract = await NFTTemplate.deploy(
    name,
    symbol,
    totalRange,
    hiddenThreshold,
    numStandardNFTs,
    owner
  );

  await nftContract.waitForDeployment();
  return await nftContract.getAddress();
}

// Run the deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
