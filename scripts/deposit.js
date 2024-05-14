const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
const OevAuctionHouseAbi = require("./contractABIs/OevAuctionHouseABI.json");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Constants
 **/
const networkRPC = "https://sepolia-rollup.arbitrum.io/rpc";              // RPC for Auction House of OEV network
const oevAuctionHouseContractAddress = "0x34f13A5C0AD750d212267bcBc230c87AEFD35CC5";  // Address of Auction House Contract
const depositValue = parseEther("0.01");                                  // Amount you want to deposit to auction house
                                                                          // 10% of value bidding will be needed (e.g. 0.01 ETH for 0.1 ETH bid)

const provider = new JsonRpcProvider(networkRPC);
//Bring in Private Key from .env
const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey, provider);

const auctionHouse = new Contract(
  oevAuctionHouseContractAddress,
  OevAuctionHouseAbi,
  wallet
);

const deposit = async () => {
  const tx = await auctionHouse.deposit({
    value: depositValue,
  });
  console.log("Transaction Hash",tx.hash);
  await tx.wait();
  console.log("Deposited");
};

deposit();
