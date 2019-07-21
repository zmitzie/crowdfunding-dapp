pragma solidity ^0.5.0;


contract CampaignFactory {
    Campaign[] public deployedCampaigns;

    function createCampaign(uint deadline, uint goal, string memory title, string memory description) public {
        Campaign newCampaign = new Campaign(msg.sender, deadline, goal, title, description);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {
        return deployedCampaigns;
    }
}


contract Campaign {

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

    modifier currentState(State _state) {
        require(state == _state);
        _;
    }

    modifier isCreator() {
        require(msg.sender == creator);
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
        creator = _creator;
        goal = _goal;
        deadline = _deadline;
        title = _title;
        description = _description;
        balance = 0;
    }

    function contribute() external currentState(State.Fundraising) payable {
        require(msg.sender != creator);
        contributions[msg.sender] = contributions[msg.sender].add(msg.value);
        balance = balance.add(msg.value);
        emit contributionReceived(msg.sender, msg.value, balance);
        checkCampaignStatus();
    }

    function checkCampaignStatus() public {
        if (balance >= goal) {
            state = State.Successful;
            payOut();
        } else if (now > deadline) {
            state = State.Expired;
        }
        completedAt = now;
    }

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

    function getRefund() public currentState(State.Expired) returns (bool) {
        require(contributions[msg.sender] > 0);

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

    function getDetails() public view returns
    (
        address payable _creator,
        string memory _title,
        string memory _description,
        uint256 _deadline,
        State _currentState,
        uint256 _balance,
        uint256 _goal
    ) {
        _creator = creator;
        _title = title;
        _description = description;
        _deadline = deadline;
        _currentState = state;
        _balance = balance;
        _goal = goal;
    }
}
