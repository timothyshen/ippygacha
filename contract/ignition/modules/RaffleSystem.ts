import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RaffleSystemModule = buildModule("RaffleSystem", (m) => {
  // Deploy IPPY NFT (reuse existing if available)
  const ippyNFT = m.contract("IPPYNFT");

  // Pyth Entropy contract address (this would be provided based on the network)
  // For testnet/mainnet, you'll need to get the actual Pyth Entropy contract address
  const entropyAddress = m.getParameter(
    "entropyAddress",
    "0x0000000000000000000000000000000000000000"
  );

  // Deploy OnChainRaffle with native IP token support
  const onChainRaffle = m.contract("OnChainRaffle", [
    entropyAddress, // Pyth Entropy contract address
    ippyNFT, // IPPY NFT contract address for prizes
  ]);

  return {
    ippyNFT,
    onChainRaffle,
  };
});

export default RaffleSystemModule;
