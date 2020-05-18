const Users = artifacts.require("Users");
const ContractFactory = artifacts.require("ContractFactory");

module.exports = function(deployer) {
  deployer.deploy(ContractFactory, Users.address);  
};
