import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RaffleSystemModule = buildModule("RaffleSystem", (m) => {
  // Deploy IPPY NFT (reuse existing if available)
  const ippyNFT = m.contract("IPPYNFT");

  // Pyth Entropy contract address (this would be provided based on the network)
  // For testnet/mainnet, you'll need to get the actual Pyth Entropy contract address
  const entropyAddress = m.getParameter(
    "entropyAddress",
    "0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb"
  );

  // Deploy OnChainRaffle with native IP token support
  const onChainRaffle = m.contract("OnChainRaffle", [
    entropyAddress, // Pyth Entropy contract address
    "0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344",
  ]);

  return {
    ippyNFT,
    onChainRaffle,
  };
});

export default RaffleSystemModule;
