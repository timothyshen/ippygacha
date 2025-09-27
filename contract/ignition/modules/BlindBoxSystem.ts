import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlindBoxSystem", (m) => {
  // Deploy IPPYNFT first (no dependencies)
  const ippyNFT = m.contract("IPPYNFT", []);
  const entropyAddress = m.getParameter(
    "entropyAddress",
    "0x5744Cbf430D99456a0A8771208b674F27f8EF0Fb"
  );

  // Deploy BlindBox with IPPYNFT address
  const blindBox = m.contract("BlindBox", [ippyNFT, entropyAddress]);

  // Set up the relationship - BlindBox contract address in IPPYNFT
  m.call(ippyNFT, "setBlindBoxContract", [blindBox]);

  return {
    ippyNFT,
    blindBox,
  };
});
