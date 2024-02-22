const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
const OevAuctionHouseAbi = require("./contractABIs/OevAuctionHouseABI.json");
const dotenv = require("dotenv");
dotenv.config();

const provider = new JsonRpcProvider(
  "https://oev-network-sepolia-testnet-rpc.eu-north-2.gateway.fm"
);

//Bring in Private Key from .env
const privateKey = process.env.PRIVATE_KEY;
const wallet = new Wallet(privateKey, provider);

const auctionHouse = new Contract(
  "0x7597985630674dA4D62Ae60ad4D10E40bb619B08", // OevAuctionHouse contract address
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
