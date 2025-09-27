import { ethers } from "hardhat";

/**
 * Deployment script for NFTFactory
 * This script deploys the factory contract that can create multiple NFT collections
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying NFTFactory with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the NFTFactory contract
  const NFTFactory = await ethers.getContractFactory("NFTFactory");
  const factory = await NFTFactory.deploy();

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log(`\n✅ NFTFactory deployed successfully!`);
  console.log(`Factory Address: ${factoryAddress}`);
  console.log(`Deployer: ${deployer.address}`);

  // Test deploying a predefined collection
  console.log(`\n🧪 Testing factory with IPPY collection...`);
  
  const tx = await factory.deployPredefinedCollection("ippy", deployer.address);
  const receipt = await tx.wait();
  
  // Get the deployed NFT address from the event
  const event = receipt?.logs.find(log => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === "NFTCollectionDeployed";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsed = factory.interface.parseLog(event);
    const nftAddress = parsed?.args.nftAddress;
    console.log(`✅ Test deployment successful!`);
    console.log(`Deployed NFT Address: ${nftAddress}`);
  }

  // Show available predefined configurations
  console.log(`\n📋 Available predefined configurations:`);
  console.log(`- "ippy": Original IPPY collection (6 standard + 1 hidden)`);
  console.log(`- "rare": High rarity collection (5 standard + 1 very rare hidden)`);
  console.log(`- "common": Common collection (4 standard + 1 common hidden)`);
  console.log(`- "standard": Standard collection (6 standard, no hidden)`);
  console.log(`- "gaming": Gaming collection (6 standard + 1 hidden)`);

  console.log(`\n💡 Usage Examples:`);
  console.log(`1. Deploy predefined collection:`);
  console.log(`   await factory.deployPredefinedCollection("ippy", ownerAddress)`);
  console.log(`\n2. Deploy custom collection:`);
  console.log(`   await factory.deployNFTCollection("MyNFT", "MNFT", 1000000, 1000, 6, ownerAddress)`);
  console.log(`\n3. Get all deployed collections:`);
  console.log(`   await factory.getAllDeployedNFTs()`);

  return factoryAddress;
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

