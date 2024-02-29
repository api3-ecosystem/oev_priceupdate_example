const hre = require("hardhat");

module.exports = async ({ getUnnamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const accounts = await getUnnamedAccounts();

  const oevSearcherMulticallV1 = await deploy("OevSearcherMulticallV1", {
    from: accounts[0],
    log: true,
  });
  log(`Deployed oevSearcherMulticallV1 at ${oevSearcherMulticallV1.address}`);
};
module.exports.tags = ["deploy"];
