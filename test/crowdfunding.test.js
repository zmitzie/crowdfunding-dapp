let catchRevert = require("./exceptionsHelpers.js").catchRevert
var CampaignFactory = artifacts.require("./CampaignFactory.sol")
var Campaign = artifacts.require("./Campaign.sol")


contract('Crowdfunding', function(accounts) {
    let campaignInstance 

    const creator = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]

    const deadline = 1566816722
    const goal = "1000000000000000000"
    const halfGoal = "500000000000000000"
    const title = "Test Title"
    const description = "Test Description"
    const amount = "50000"
    
  
    beforeEach(async () => {
      factoryInstance = await CampaignFactory.new()
      await factoryInstance.createCampaign(deadline, goal, title, description, {from: creator})
      const campaignAddress = await factoryInstance.getDeployedCampaigns();
      campaignInstance = await Campaign.at(campaignAddress[0])
    })

    it("should not accept contribution from creator", async () => {
      await catchRevert(campaignInstance.contribute({from: creator, value: amount}))
    });

    it("should not accept contribution for a successful campaign", async () => {
      await campaignInstance.contribute({from: alice, value: goal})
      await catchRevert(campaignInstance.contribute({from: alice, value: amount}))
    });

    it("should increase campaign balance when a contribution is made", async () => {
      await campaignInstance.contribute({from: alice, value: amount})
      const newBalance = await campaignInstance.balance()
      assert.equal(newBalance, amount, 'Amount deposited is not reflected to balance of the contract')
    });

    it("should log contributors address and amount", async () => {
      await campaignInstance.contribute({from: alice, value: amount})
      const amountContributed = await campaignInstance.contributions(alice)
      assert.equal(amountContributed, amount, 'Mapping did not return the correct amount that the user deposited')
    });

    it("should mark campaign successful once the goal has been reached", async () => {
      await campaignInstance.contribute({from: alice, value: goal})
      const newState = await campaignInstance.state()
      assert.equal(newState, 2, 'Campaign state not changed to successful')
    });
    
    it("should set balance to zero once the goal has been reached", async () => {
      await campaignInstance.contribute({from: alice, value: halfGoal})
      await campaignInstance.contribute({from: alice, value: halfGoal})

      const newBalance = await campaignInstance.balance()
      assert.equal(newBalance, 0, 'Balance not set to zero')
    });

    it("should transfer campaign balance to creator once the goal has been reached", async () => {
      let balanceAfterContractCreation =  await web3.eth.getBalance(creator);
      let previousBalance = Number(web3.utils.fromWei(balanceAfterContractCreation)) + Number(web3.utils.fromWei(goal))
      
      await campaignInstance.contribute({from: alice, value: goal})
      let actualBalance = await web3.eth.getBalance(creator);

      assert.deepEqual(previousBalance, Number(web3.utils.fromWei(actualBalance)), "Campaign balance not transfered to creator");
    });

    it("should not allow user to get a refund while the campaign is active", async() => {
      await campaignInstance.contribute({from: alice, value: goal})
      await catchRevert(campaignInstance.getRefund({from: alice}))
    })

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