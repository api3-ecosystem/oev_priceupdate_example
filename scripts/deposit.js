const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
const OevAuctionHouseAbi = require("./contractABIs/OevAuctionHouseABI.json");
const dotenv = require("dotenv");
dotenv.config();

const provider = new JsonRpcProvider(
  "https://sepolia-rollup.arbitrum.io/rpc"
);

//Bring in Private Key from .env
const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey, provider);

const auctionHouse = new Contract(
  "0x34f13A5C0AD750d212267bcBc230c87AEFD35CC5", // OevAuctionHouse contract address
  OevAuctionHouseAbi,
  wallet
);

const deposit = async () => {
  const tx = await auctionHouse.deposit({
    value: parseEther("0.01"),
  });
  console.log(tx.hash);
  await tx.wait();
  console.log("Deposited");
};

deposit();
