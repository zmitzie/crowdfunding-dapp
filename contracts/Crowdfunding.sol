pragma solidity ^0.5.8;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

/// @title A factory contract that creates campaigns
/// @author Zacharias Mitzelos
/// @notice CampaignFactory creates and holds the deployed addresses of campaigns
contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    /// @notice Deploys a Campaign contract with the given params
    function createCampaign(uint deadline, uint goal, string memory title, string memory description) public {
        Campaign newCampaign = new Campaign(msg.sender, deadline, goal, title, description);
        deployedCampaigns.push(newCampaign);
    }

    /// @notice Returns the addresses of deployed Campaigns
    /// @return array of addresses for deployed Campaigns
    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}

/// @title The Campaign contract
/// @author Zacharias Mitzelos
/// @notice The campaign contract contains the functionality to manage a campaign
contract Campaign {
    using SafeMath for uint256;

    enum State {
        Fundraising,
        Expired,
        Successful
    }

    address payable public creator;
    uint public goal;
    uint public deadline;
    uint public completedAt;
    uint256 public balance;

    string public title;
    string public description;
    mapping (address => uint) public contributions;
    State public state = State.Fundraising;

    event contributionReceived(address contributor, uint amount, uint _balance);

    /// @notice Verifies that the current state is the one that is required for the specific function
    modifier currentState(State _state) {
        require(state == _state, "The campaign is in a different state than it should be to run this function");
        _;
    }

    constructor
    (
        address payable _creator,
        uint _deadline,
        uint _goal,
        string memory _title,
        string memory _description
    ) public {
        require(_deadline > now, "The deadline should be set at a later date");
        require(_goal > 0, "Goal amount should be higher than zero");
        creator = _creator;
        goal = _goal;
        deadline = _deadline;
        title = _title;
        description = _description;
        balance = 0;
    }

    /// @notice Receives a contribution for an active Camaign
    /// @dev Will verify that the state is Fundraising, log the contributor address and amount,
    //  increase the campaign balance var, emit an event and check the campaign status
    function contribute() external currentState(State.Fundraising) payable {
        require(msg.sender != creator, "The creator of the campaign cannot contribute to it");
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        balance = balance.add(msg.value);
        emit contributionReceived(msg.sender, msg.value, balance);
        checkCampaignStatus();
    }

    /// @notice Will run afer every contribution
    /// @dev Checks if the deadline passed based on the block timestamp
    function checkCampaignStatus() public {
        if (balance >= goal) {
            state = State.Successful;
            payOut();
        } else if (now > deadline) {
            state = State.Expired;
        }
        completedAt = now;
    }

    /// @notice Pays out the balance to the creator of the campaign
    /// @dev Set to internal, will be called from checkCampaignStatus()
    /// @return true or false, if the transfer of the balance to the creator was successful
    function payOut() internal currentState(State.Successful) returns (bool) {
        uint256 amountRaised = balance;
        balance = 0;

        if (creator.send(amountRaised)) {
            return true;
        } else {
            balance = amountRaised;
            state = State.Successful;
        }
        return false;
    }

    /// @notice Can be called by any contributor if the state of the Campaign is set to Expired
    /// @return true or false, if the refund succeeded
    function getRefund() public currentState(State.Expired) returns (bool) {
        require(contributions[msg.sender] > 0, "No contributions found from this address");

        uint amountToRefund = contributions[msg.sender];
        contributions[msg.sender] = 0;

        if (!msg.sender.send(amountToRefund)) {
            contributions[msg.sender] = amountToRefund;
            return false;
        } else {
            balance = balance.sub(amountToRefund);
        }
        return true;
    }

    /// @notice Returns all the state variables of the contract
    function getDetails() public view returns
    (
        address payable _creator,
        string memory _title,
        string memory _description,
        uint256 _deadline,
        State _currentState,
        uint256 _balance,
        uint256 _goal,
        uint _completedAt
    ) {
        _creator = creator;
        _title = title;
        _description = description;
        _deadline = deadline;
        _currentState = state;
        _balance = balance;
        _goal = goal;
        _completedAt = completedAt;

    }
}
