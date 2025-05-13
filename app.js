import express from "express";
import cors from "cors";
import {
  createThirdwebClient,
  getContract,
  sendTransaction,
} from "thirdweb";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";

const app = express();
app.use(cors({ origin: "https://your-frontend-domain.com" })); // Specify allowed origins
app.use(express.json());

if (!process.env.THIRDWEB_SECRET_KEY) {
  throw new Error("Missing THIRDWEB_SECRET_KEY in environment variables");
}

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

const contract = getContract({
  address: "0x9Fc9b00d0D2988825cfA7B01E5dd2F726b172821",
  chain: polygon,
  client,
});

const wallet = inAppWallet();

app.post("/mint", async (req, res) => {
  try {
    const { to, name, description, image } = req.body;

    // Validate input
    if (!to || !name || !description || !image) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Connect backend wallet
    const account = await wallet.connect({
      client,
      strategy: "backend",
      walletSecret: process.env.WALLET_SECRET, // Use environment variable
    });

    // Mint the NFT
    const transaction = await mintTo({
      contract,
      to,
      nft: { name, description, image },
    });

    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    });

    res.status(200).json({ success: true, transactionHash });
  } catch (error) {
    console.error("Error minting NFT:", error); // Log the error internally
    res.status(500).json({ error: "An internal server error occurred" }); // Generic error message for the client
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
