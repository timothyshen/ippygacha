import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NFTMarketplace", (m) => {
  const nftMarketplace = m.contract("NFTMarketplace", []);

  return {
    nftMarketplace,
  };
});
