# Avoiding common attacks

## Re-entrancy & DoS attacks
For the `payOut()` and the `getRefund()` functions of the Campaign contract, the appropriate techniques have been used to protect against re-entrancy and DoS attacks. Specifically for the `payOut()` function, we set the current contract balance to a new variable, and we set the balance state var to zero. Afterwards, with an if/else statement we check if the transfer was successful, and if it is not we set the balance state var back to the actual balance.

## Transaction Ordering and Timestamp Dependence
We depend on block timestamps to check whether or not the campaign has expired. However, the dangers of exploiting the timestamps by miners is not applicable in our case, as campaign deadlines are set by date and they are not specified down to the second.

## Integer Overflow and Underflow
To avoid integer overflows and underflows, we are using the SafeMath library by OpenZeppelin.

