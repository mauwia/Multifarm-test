/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();
module.exports = {
  defaultNetwork: "hardhat",
  gasReporter: {
    enabled: false,
  },
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfimation: 1,
      // forking: {
      //   url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      // },
    },
    sepolia: {
      chainId: 11155111,
      blockConfimation: 6,
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 200000,
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API,
      sepolia: process.env.ETHERSCAN_API,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  // solidity: {
  //   version: "0.8.0",
  //   settings: {
  //     metadata: {
  //       // Not including the metadata hash
  //       // https://github.com/paulrberg/hardhat-template/issues/31
  //       bytecodeHash: "none",
  //     },
  //     // Disable the optimizer when debugging
  //     // https://hardhat.org/hardhat-network/#solidity-optimizer-support
  //     optimizer: {
  //       enabled: true,
  //       runs: 800,
  //     },
  //   },
  // },
  solidity: {
    compilers: [
      { version: "0.8.0" },
      { version: "0.8.13" },
      // { version: "0.6.12" },
      // { version: "0.6.6" },
    ],
  },
};
