const ContractFactory = artifacts.require("ContractFactory");
const RFPs = artifacts.require("RFPs");

module.exports = function(deployer) {
  deployer.deploy(RFPs, ContractFactory.address);
};
