// routes/emailRoutes.js
import { Router } from "express";
import { listEmails } from "../gmailService";
const router = Router();

const CLIENT_ID =
  "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com"; // Same as frontend
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://jump-woad.vercel.app";

router.get("/emails", async (req, res) => {
  const userId = req.user.id;
  console.log("id ------>", userId);
  const tokens = await getUserTokensFromDB(userId);
  const config = {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  };

  try {
    const emails = await listEmails(
      tokens,
      ["INBOX"],
      config,
      saveTokensToDB,
      userId
    );
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// function to save tokens securely in DB or cache
async function saveTokensToDB(userId, tokens) {
  // update tokens in DB for userId
}

export default router;
