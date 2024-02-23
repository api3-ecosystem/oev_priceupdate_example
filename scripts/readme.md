# Finding Liquidation Opportunities in DeFi Platforms

## Introduction

In order to find opportunities in lending Dapps, we must gather information about the users of the Dapp.  With this information we can monitor the health of the loans within the protocol.  This guide will take you through the flow of the process.


## Step 1: Tracking Deposits

We want to keep a local database of addresses that we can quickly access to constantly update and check health positions.  In many cases, an index subgraph can pull historic data that we can store locally.  In this case, we do not have that option and we must manually pull the data from the contract itself. 

### Collecting Deposit Events

1. **Listen for Deposit Events**: Use ethers.js to listen to or query past `Deposit` events emitted by the lending platform's smart contract. These events indicate that a wallet has deposited assets. In most cases, we want to keep track of the addresses AND the assets deposited.  In this hackathon example, we know that the only asset being provided is the [OEV Token](https://sepolia.etherscan.io/address/0x5Df761cB11aEd75618a716e252789Cdc9280f5A6) so we won't need to keep a database of the assets

2. **Store Wallet Addresses**: For simplicity and rate limiting, we have provided the deposited addresses in a [separate json](wallets/wallets.json) file for your use if necessary.  Bonus points if you write a script to pull them in your own way from the lending contract 0xEeEed4f0cE2B9fe4597b6c99eD34D202b4C03052 

## Step 2: Monitoring Health Factors

Now that we have a list of wallets available to us, we want to check their health positions to identify upcoming opportunities are available to us.

### Checking Wallet Health

1. **The LendingPool contract `getUserAccountData` function**: We call the `getUserAccountData(address_user)` function for each collected address to fetch their account data, including the health factor. `Contract Address On Sepolia: 0xEeEed4f0cE2B9fe4597b6c99eD34D202b4C03052`

```
const provider = new ethers.JsonRpcProvider("your RPC");
const LendingPoolAbi = [
    "function getUserAccountData(address _user) external view returns (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
    ];
const lendingPool = new ethers.Contract("0xEeEed4f0cE2B9fe4597b6c99eD34D202b4C03052", LendingPoolAbi, provider);
const userDetails = await lendingPool.getUserAccountData(user);
```

2. **Understand the Data**:
    - `totalCollateral`: The total value of collateral deposited.
    - `totalDebt`: The total value of debt taken.
    - `availableLiquidity`: Funds available to borrow.
    - `currentLiquidationThreshold`, `LTV`, and `healthFactor`: Key metrics indicating the risk of liquidation.

Data example: 

    - totalCollateral: '172894861653996532841',
    - totalDebt: '61882797595521523630',
    - availableLiquidity: '71211666905725007351',
    - currentLiquidationThreshold: '8542',
    - LTV: '7698',
    - healthFactor: '2386556467439538886'

3. **Filter by Health Factor**: Focus on wallets with health factors close to 1 (considering the 18 decimal places for wei).

4. **Important Factor**: In real use cases, when creating this list of opportunities we must consider the Deposited and Borrowed Positions.  We need to know what asset to payback and what asset will get rewarded with.  In this hackathon example, we know the the OEV token is the supplied asset, and USDC is the borrow asset we must pay back.

## Step 3: Calculating Liquidation Prices

### Determining the Price for Liquidation

1. **Apply the Formula**: Use the formula `Liquidation Price = (totalDebt) / (totalCollateral * LTV)` to calculate the price at which the collateral (OEV Token) would need to fall to become eligible for liquidation, expressed in terms of the debt asset (USDC).

2. **The Bidding Price**: Based on your calculations, this is the price that will make the users position able to be liquidated.  This would be our bidding price that we would like to update the price oracle on that specific chain.  Depending on the trend, rising or lowering, we would submit a Greater than or Lower than bid based off our price.

## Step 4: Bid in the AuctionHouse on the OEV Network

1. **Deposit OEV Network ETH to Auction Contract**: Make sure to deposit ETH to the auction contract as this will allow you to place bids on the auction contract based on the amount that you have deposited.

2. **Make the Bid**: Put in all the details about our bid here:
 - What chain we are bidding for (For this hackathon Sepolia ONLY)
 - What Proxy address we want to update (For this hackathon OEV Proxy)
 - What is the condition (Greater or Lower than the proposed price)
 - What is the price value we want to update at (The point a position is liquidatable)
 - Who/What address will be doing the update on the requested chain (Our deployed multicall contract)

    For in depth details about this process, please refer to this [example](https://github.com/api3-ecosystem/oev_priceupdate_example)


3. **Listen for Winning Bids**: We can listen for the event of `AwardedBid` on the OEV auctionHouse contract (`0x34f13A5C0AD750d212267bcBc230c87AEFD35CC5` on the OEV Network) to see if our bid has been awarded.

Alternately, we can check on bidId statuses by check on the auctionHouse contract by calling `bids` and passing our encoded bidId details.

4. **Receive Winning Bid Details**: Once we have been awarded the winning bid, we take the returned `awardDetails` and use those signatures to call on API3Server contract address via our deployed `multiCall` contract.


## Step 4: Preparing for Liquidation

1. **Preping our Transaction**: Now that we have the signature to update the price, we want to prepare our liquidation mechanism.  
- We will update the OEV Token proxy price feed
- Pay the bidding fee to the Dapp (via a Value pass)
- In the same transaction, repay the debt the maximum amount making sure our wallet has enough to pay back the loan  (in this hackathon it is purely USDC)
    - The use of flash loans is a common practice to repay debt.  We will not be covering this here as you can just use the [USDC Faucet](https://sepolia.etherscan.io/address/0x3D5ebDbF134eAf86373c24F77CAA290B7A578D7d#writeContract) to mint out the tokens required to pay back.
    - If you would like, you can make use of flashloans to pay off the debt

2. **Bulking the Transactions**: If we were to update the price and then try to liquidate the position in two separate transactions, we would lose our opportunity to MEV.  Instead we utilize our deployed `multiCal contract`, from this [example](https://github.com/api3-ecosystem/oev_priceupdate_example), by combining our transactions into a single call to optimize the process. 

3. **Risk Management**: Always consider the risks involved in liquidation, including potential price slippage and gas costs.

## Flow of the Process
![Liquidation Flow](/images/liquidflow.png "Liquidation Flow")
[Larger Image](https://i.imgur.com/kb7ZA7K.png)

