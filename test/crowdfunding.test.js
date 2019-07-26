let catchRevert = require("./exceptionsHelpers.js").catchRevert
var CampaignFactory = artifacts.require("./CampaignFactory.sol")
var Campaign = artifacts.require("./Campaign.sol")


contract('Crowdfunding', function(accounts) {
    let campaignInstance 

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const deposit = web3.utils.toBN(2)

    const deadline = 1566816722
    const goal = "1000000000000000000"
    const title = "Test Title"
    const description = "Test Description"
    const amount = "50000"
    
  
    beforeEach(async () => {
      factoryInstance = await CampaignFactory.new()
      await factoryInstance.createCampaign(deadline, goal, title, description, {from: owner})
      const campaignAddress = await factoryInstance.getDeployedCampaigns();
      console.log(campaignAddress)
      campaignInstance = await Campaign.at(campaignAddress[0])
    })

    it("should not accept contribution from owner", async () => {
      await catchRevert(campaignInstance.contribute({from: owner, value: "1000"}))
    });

    it("should not accept contribution for a successful campaign", async () => {
      await campaignInstance.contribute({from: alice, value: goal})
      await catchRevert(campaignInstance.contribute({from: alice, value: "1000"}))
    });

    it("should increase campaign balance when a contribution is made", async () => {
      await campaignInstance.contribute({from: alice, value: amount})
      const newBalance = await campaignInstance.balance()
      assert.equal(newBalance, amount, 'Amount deposited is not reflected to balance of the contract')
    });

    it("should record contributors address and amount", async () => {
      await campaignInstance.contribute({from: alice, value: amount})
      const amountContributed = await campaignInstance.contributions(alice)
      assert.equal(amountContributed, amount, 'Mapping did not return the correct amount that the user deposited')
    });

    it("should emit the appropriate event when a contribution is made", async () => {
      let result = await campaignInstance.contribute({from: alice, value: amount})

      const contributor = result.logs[0].args.contributor
      const _amount = result.logs[0].args.amount.toNumber()
      const _balance = result.logs[0].args._balance.toNumber()

      const newBalance = await campaignInstance.balance()

      const expectedResult = {contributor: contributor, _amount: amount, _balance: _balance}
      assert.equal(expectedResult.contributor, alice, "contributionReceived event contributor property not emitted during user contribution")
      assert.equal(expectedResult._amount, _amount, "contributionReceived event amount property not emitted during user contribution")
      assert.equal(expectedResult._balance, newBalance, "contributionReceived event _balance property not emitted during user contribution")
    });
})