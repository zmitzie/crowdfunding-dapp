
# Design Pattern Decisions

## Fail early and fail loud
Instead of `if` we used the `require` keyword in our functions to throw an error and stop further execution.

## Restricting Access
There was no need to implement a function modifier to check if the msg.sender was the campaign creator, as all functions except `contribute()`, were intended to be used by everyone.

The only function modifier we implemented was on the CampaignFactory contract for the circuit breaker mechanism - onlyOwner() 

## Auto Deprecation
N/A

## Mortal
N/A

## Pull over Push Payments (the Withdrawal Pattern)
For the `payOut()` and the `getRefund()` functions, the appropriate techniques have been used to protect against re-entrancy and DoS attacks.

## Circuit Breaker
Implemented a simple circuit breaker mechanism in the CampaignFactory contract. When the `stop` boolean value is set by the owner of the CampaignFactory contract to `true` then deployments of new Campaign contracts are stopped.

## State Machine
The Campaign contract acts as a state machine. We implemented an enumeration with the different states of the campaign, and also a function modifier called `currentState` to check that the required state is the current state of the contract.

## Speed Bump
N/A

** Based on the 10.1 Module of the Consensys Blockchain Developer Bootcamp