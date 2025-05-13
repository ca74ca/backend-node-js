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
app.use(cors());
app.use(express.json());

const client = createThirdwebClient({
secretKey: "6Ef...2h1",
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
    // Connect backend wallet
    const account = await wallet.connect({
      client,
      strategy: "backend",
      walletSecret: "111962"
    });
    const transaction = mintTo({
      contract,
      to,
      nft: { name, description, image },
    });
    const { transactionHash } = await sendTransaction({
      transaction,
      account,
    });
    res
      .status(200)
      .json({ success: true, transactionHash });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
