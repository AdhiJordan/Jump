import Category from "../models/category.js";
import UserToken from "./../models/userToken.js";
import { listEmails } from "./../gmailService.js";
import { default as getUserTokensFromDB } from "./../data/userTokens.js";

async function saveTokensToDB(userId, tokens) {
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
    const userId = req.user.sub;
    const categoryId = req.params.categoryId;
    const categoryName = req.params.categoryName;
    const labelsFilter = categoryName ? categoryName.split(",") : null;

    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) return res.status(404).json({ error: "Category not found" });

    const CLIENT_ID =
      "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com";
    const CLIENT_SECRET = "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";
    const REDIRECT_URI = "https://jump-mcmg.vercel.app/auth/google/callback";

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
    // here i'm trying to connect OPEN AI to get summary of my email but due to lack of npm cursor ai i couldn't able to
    // connect rather i used open ai.

    res.json(emails);
  } catch (err) {
    console.error("Error in getCategoryEmailsWithAI:", err);
    res.status(500).json({ error: "Failed to fetch emails for category" });
  }
}
