const hre = require("hardhat");

async function main() {
  const OevSearcherMulticallV1 = await hre.ethers.deployContract("OevSearcherMulticallV1");

  // Deploy the contract to ETH Sepolia
  console.log("Deploying contract...");
  await OevSearcherMulticallV1.waitForDeployment();

  console.log("Contract deployed at address:", OevSearcherMulticallV1.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
