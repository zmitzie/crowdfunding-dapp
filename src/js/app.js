App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
    }
    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: function () {
    $.when(
      $.getJSON('CampaignFactory.json', function (data) {
        var CampaignFactoryArtifact = data
        App.contracts.CampaignFactory = TruffleContract(CampaignFactoryArtifact)
        App.contracts.CampaignFactory.setProvider(App.web3Provider)
      }),

      $.getJSON('Campaign.json', function (data) {
        var CampaignArtifact = data;
        App.contracts.Campaign = TruffleContract(CampaignArtifact);
        App.contracts.Campaign.setProvider(App.web3Provider);
      })
    ).then(function () {
      return App.loadCampaigns()
    });

  },

  //getter for Campaigns
  loadCampaigns: function () {
    var campaignFactoryInstance
    var campaignInstance
    App.contracts.CampaignFactory.deployed().then(function (instance) {
      campaignFactoryInstance = instance
      return campaignFactoryInstance.getDeployedCampaigns.call()
    }).then(function (deployedCampaigns) {
      //loop addresses obtained from CampaignFactory
      for (var i = 0; i < deployedCampaigns.length; i++) {
        App.contracts.Campaign.at(deployedCampaigns[i]).then(function (instance) {
          campaignInstance = instance
          campaignInstance.getDetails.call().then(function (detailsOfCampaign) {
            console.log(detailsOfCampaign)
            var campaignsRow = $('#campaignsRow');
            var campaignTemplate = $('#campaignTemplate');
            campaignTemplate.find('.campaign-creator').text(detailsOfCampaign[0]);
            campaignTemplate.find('.panel-title').text(detailsOfCampaign[1]);
            campaignTemplate.find('.campaign-description').text(detailsOfCampaign[2]);
            campaignTemplate.find('.campaign-deadline').text(new Date(parseInt(detailsOfCampaign[3])* 1000));
            if (detailsOfCampaign[4] == 0) {
              campaignTemplate.find('.campaign-state').text("Fundraising");
            } else if (detailsOfCampaign[4] == 1) {
              campaignTemplate.find('.campaign-state').text("Expired");
            } else {
              campaignTemplate.find('.campaign-state').text("Successful");
            }
            campaignTemplate.find('.campaign-balance').text(web3.fromWei(detailsOfCampaign[5]));
            campaignTemplate.find('.campaign-goal').text(web3.fromWei(detailsOfCampaign[6]));
            campaignTemplate.find('.campaign-completedat').text(new Date(parseInt(detailsOfCampaign[7])* 1000));
            campaignTemplate.find('.input-hidden').val(instance.address);
            campaignTemplate.find('.input').attr('data-id', instance.address);
            campaignTemplate.find('.btn-contribute').attr('data-id', instance.address);
            campaignsRow.append(campaignTemplate.html());
    }).catch(function (err) {
      console.log(err.message)
    })
    return App.bindEvents();

  },

  bindEvents: function () {
    $(document).on('click', '.btn-contribute', App.processContribution);
  },

  processContribution: function (event) {
    event.preventDefault();

    var campaignId = $(event.target).data('id');
    var amount = $('input[data-id="' + campaignId + '"]').val();
    var campaignInstance
    web3.eth.getAccounts(function (err, accounts) {
      if (err) console.log(err)
      var account = accounts[0]

      App.contracts.Campaign.at(campaignId).then(function (instance) {
        campaignInstance = instance
        return campaignInstance.contribute({ from: account, value: web3.toWei(amount, 'ether') })
      }).then(function (result) {
        return App.loadCampaigns()
      }).catch(function (err) {
        alert(err.message)
      })
    })
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
