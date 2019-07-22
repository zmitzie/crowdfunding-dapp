var Crowdfunding = artifacts.require("CampaignFactory");

module.exports = function(deployer) {
  deployer.deploy(Crowdfunding);
};