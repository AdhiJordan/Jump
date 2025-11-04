import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { listEmails } from "./gmailService.js";
import { default as getUserTokensFromDB } from "./data/userTokens.js";
import { default as authenticateJWT } from "./middleware/authenticateJWT.js";
import UserToken from "./models/userToken.js";
import Category from "./models/category.js";
import mongoose from "mongoose";
import { getCategories } from "./controller/categoryController.js";
import { getCategoryEmailsWithAI } from "./controller/emailController.js";
import { ingestEmailsForUser } from "./emailIngestionService.js";

const mongoURI =
  "mongodb+srv://adhithyaprabhu77_db_user:GhsNisbqmfvrKgYi@jumpcluster.rotj16f.mongodb.net/?appName=JumpCluster"; // replace with your MongoDB connection string

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app = express();
app.use(express.json());

app.use(express.json({ limit: "10000000mb" }));

app.use(express.urlencoded({ limit: "10000000mb", extended: true }));

const CLIENT_ID =
  "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com"; // Same as frontend
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://jump-mcmg.vercel.app/auth/google/callback";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  "https://jump-mcmg.vercel.app/auth/google/callback"
);

app.use(
  cors({
    origin: "https://jump-woad.vercel.app",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/auth/google", (req, res) => {
  const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.labels",
    "openid",
    "email",
    "profile",
  ];
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: false,
  });
  res.redirect(authUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No auth code in query");
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log("Tokens:", tokens);
    console.log("Granted scopes:", tokens.scope);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // Store tokens or create user session as needed
    const userId = "113438802828677635763";
    await saveTokensToDB(userId, tokens);
    const redirectUrl = new URL("https://jump-woad.vercel.app");
    // res.redirect("http://localhost:5173");
    redirectUrl.searchParams.set(
      "user",
      encodeURIComponent(JSON.stringify(payload))
    );
    redirectUrl.searchParams.set("token", tokens.id_token);
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed.");
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;
  console.log("%%%%%%%%", token);
  if (!token) return res.status(400).send("No token provided");
  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    res.json({ success: true, user: payload });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).send("Invalid token");
  }
});

async function saveTokensToDB(userId, tokens) {
  console.log("save////////");
  await UserToken.findOneAndUpdate(
    { userId },
    {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

app.get("/api/emails", authenticateJWT, async (req, res) => {
  const userId = req.user.sub;
  console.log("id ******** =====>", userId);
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
    console.log("^^^^^", emails[0]);
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories-all", authenticateJWT, getCategories);

app.post("/api/categories", authenticateJWT, async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.sub;
  const category = new Category({ userId, name, description });
  await category.save();
  res.json(category);
});

app.get(
  "/api/categories/:categoryId/emails/:categoryName",
  authenticateJWT,
  getCategoryEmailsWithAI
);

// /routes/emailRoutes.js
app.post("/emails/import", authenticateJWT, async (req, res) => {
  const userId = req.user.sub;
  const tokens = await getUserTokensFromDB(userId);
  await ingestEmailsForUser(userId, tokens);

  res.json({ success: true, message: "Emails imported and processed" });
});

app.post("/api/unsubscribe", authenticateJWT, async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ success: false, error: "No emails passed" });
  }

  try {
    await batchUnsubscribeEmails(emails);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(4000, () =>
  console.log("Server running at https://jump-mcmg.vercel.app")
);
