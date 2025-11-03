import UserToken from "./../models/userToken.js";

export default async function getUserTokensFromDB(userId) {
  try {
    const record = await UserToken.findOne({ userId }).exec();
    if (!record) {
      throw new Error(`No tokens found for user: ${userId}`);
    }

    return {
      access_token: record.accessToken,
      refresh_token: record.refreshToken,
      token_type: "Bearer",
      expiry_date: record.expiryDate,
    };
  } catch (error) {
    console.error("Error fetching user tokens from DB:", error);
    throw error;
  }
}
