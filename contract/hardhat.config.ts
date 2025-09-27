import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const privateKey = process.env.PRIVATE_KEY;

// if (!alchemyApiKey || !privateKey) {
//   throw new Error("ALCHEMY_API_KEY and PRIVATE_KEY must be set");
// }

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    storyAeneid: {
      url: `https://story-aeneid.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: {
      storyAeneid: "abc",
    },
    customChains: [
      {
        network: "storyAeneid",
        chainId: 1315,
        urls: {
          apiURL: "https://aeneid.storyscan.io/api",
          browserURL: "https://aeneid.storyscan.io",
        },
      },
    ],
  },
};

export default config;
