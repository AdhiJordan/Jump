// tokenStorage.js
const UserToken = require("./models/UserToken");

async function saveTokensToDB(userId, tokens) {
  const { access_token, refresh_token, expiry_date } = tokens;

  const update = {
    accessToken: access_token,
    expiryDate: expiry_date,
  };
  if (refresh_token) {
    update.refreshToken = refresh_token; // Update refresh token only if present
  }

  return UserToken.findOneAndUpdate({ userId }, update, {
    upsert: true,
    new: true,
  });
}

async function getUserTokensFromDB(userId) {
  return UserToken.findOne({ userId });
}

module.exports = {
  saveTokensToDB,
  getUserTokensFromDB,
};
