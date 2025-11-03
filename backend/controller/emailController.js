import EmailMappingSchema from "../models/email.js";
import Category from "../models/category.js";
import { summarizeEmail } from "../aiService.js";
import UserToken from "./../models/userToken.js";
import { listEmails } from "./../gmailService.js";
import { default as getUserTokensFromDB } from "./../data/userTokens.js";

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

export async function getCategoryEmailsWithAI(req, res) {
  try {
    const userId = req.user.sub; // Ideally consistent user ID from auth token
    const categoryId = req.params.categoryId;
    const categoryName = req.params.categoryName;
    // Optional: labels filter passed as comma-separated string, e.g., ?labels=INBOX,UNREAD
    const labelsFilter = categoryName ? categoryName.split(",") : null;

    // Find category for AI context (optional but good for validation)
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Build query criteria
    // const query = {
    //   userId: userId,
    //   categoryId: categoryId,
    // };

    const CLIENT_ID =
      "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com"; // Same as frontend
    const CLIENT_SECRET = "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";
    const REDIRECT_URI = "http://localhost:4000/auth/google/callback";

    const tokens = await getUserTokensFromDB(userId);
    const config = {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
    };

    let emails = await listEmails(
      tokens,
      ["INBOX"],
      config,
      saveTokensToDB,
      userId
    );
    // Fetch emails for user and category

    // If labels filter provided, filter emails by intersection with labelIds array
    if (labelsFilter && labelsFilter.length > 0) {
      emails = emails.filter(
        (email) =>
          email.labelIds &&
          email.labelIds.some((label) => labelsFilter.includes(label))
      );
    }

    // Ensure summary exists for each email; generate via AI if missing
    // for (const email of emails) {
    //   if (!email.summary) {
    //     email.summary = await summarizeEmail(email.body || email.snippet);
    //     //await email.save();
    //   }
    // }

    res.json(emails);
  } catch (err) {
    console.error("Error in getCategoryEmailsWithAI:", err);
    res.status(500).json({ error: "Failed to fetch emails for category" });
  }
}
