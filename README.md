
# Crowdfunding dApp

## About
This is a crowdfunding dApp developed for the Consensys Blockchain Developer Bootcamp. It is a truffle project, with the Smart Contracts written in Solidity. For the frontend we are using lite-server and jQuery to interact with the contracts.

## Project Description
The project consists of two Smart Contracts, CampaignFactory and Campaign. CampaignFactory creates and holds the addresses of the deployed Campaign contracts, while Campaign corresponds to a specific campaign and holds all the functionality to make a contribution, to pay out the creator, as well as to refund the contributors in case the campaign expires.

Through the web interface, a user with a web3 enabled browser (or Metamask), can create a Campaign or view and contribute to existing ones. To create a campaign, a title, short description, the goal amount and a deadline is required. After successful creation, the new campaign in then visible in the frontpage. A user can choose a campaign that is in the `Fundraising` state and contribute ETH. Once the goal amount has been reached, the campaign is set to `Successful` and no more contributions are accepted, as all the contributions are transferred to the creator of the Campaign. In case that a campaign doesn't collect the goal amount within the given timeframe set during creation by the creator, then it is marked as `Expired`, no more contributions are accepted and existing contributors can ask for a refund through the web interface. The contract then checks if the contributor contributed ETH, and returns the amount that he contributed back to the his address.  

## Running the Project
### Install the necessary dependencies
* Run `npm install -g truffle`
* Run `npm install -g ganache-cli`
* Make sure you have installed Metamask

### Clone repository
* Run `git clone github.com/zmitzie/crowdfunding-dapp.git`
* `cd crowdfunding-dapp`
* Run `npm install`

### Run in a local development blockchain (ganache)
If you want to run the project in a local development blockchain, then follow the steps:
* Open a new terminal window and run `ganache-cli`
* Copy the Mnemonic and import it to Metamask
* Go back to the first terminal window and run `truffle compile`
* Run `truffle migrate`
* Run `npm run dev` to start the server
* In Metamask set your network to `localhost:8545`

### Run in Rinkeby
If you don't want to run the project in locally, then follow the steps to deploy the contracts to Rinkeby:
* Fund your account in Metamask with Rinkeby Test Ether, and set your network to `Rinkeby Test Network`
* Export your mnemonic, create a new file in the root directory of the project called `.secret`, paste the mnemonic and close it
* Sign up to Infura, and get a URL with your project id on it for the Rinkeby network.
* Create a `.env` file on the root directory of the project based on `example.env` and paste the infura URL
* Open `truffle-config.js` and uncomment lines 21-25 and 63-67
* In the terminal run `truffle compile`
* Run `truffle migrate -f 2 --network rinkeby`
* Run `npm run dev` to start the server

## Tests
To run tests with truffle, open a new terminal window  and run `ganache-cli`. On the first terminal window, run `truffle test`. All 9 tests should pass.
