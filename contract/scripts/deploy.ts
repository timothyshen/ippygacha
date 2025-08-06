import { ignition } from "hardhat";
import BlindBoxSystemModule from "../ignition/modules/BlindBoxSystem";

async function main() {
  console.log("🚀 Deploying BlindBox System...");

  // Method 1: Deploy everything at once (Recommended)
  console.log("\n📦 Single Module Deployment");
  const { ippyNFT, blindBox } = await ignition.deploy(BlindBoxSystemModule);

  console.log("✅ IPPYNFT deployed to:", await ippyNFT.getAddress());
  console.log("✅ BlindBox deployed to:", await blindBox.getAddress());

  // Verify the setup
  const ippyNFTAddress = await blindBox.ippyNFT();
  const blindBoxAddress = await ippyNFT.blindBoxContract();

  console.log("\n🔗 Contract Relationships:");
  console.log("BlindBox -> IPPYNFT:", ippyNFTAddress);
  console.log("IPPYNFT -> BlindBox:", blindBoxAddress);

  // Get contract info for frontend
  const contractInfo = await blindBox.getContractInfo();
  console.log("\n📊 BlindBox Info:");
  console.log("Price per box:", contractInfo.price.toString(), "wei");
  console.log("Max per transaction:", contractInfo.maxPerTx.toString());
  console.log("Total supply:", contractInfo.totalSupply.toString());
  console.log("Current supply:", contractInfo.currentSupplyCount.toString());
  console.log("Remaining boxes:", contractInfo.remainingBoxes.toString());

  // Get probability info
  const probInfo = await blindBox.getProbabilityInfo();
  console.log("\n🎲 Probability Info:");
  console.log(
    "Hidden NFT chance:",
    probInfo.hiddenProbabilityBasisPoints.toString(),
    "basis points"
  );
  console.log("Total range:", probInfo.totalRange.toString());

  return { ippyNFT, blindBox };
}

// Run deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

export { main, deployMethodTwo };
