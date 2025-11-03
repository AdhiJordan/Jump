// // models/UserToken.js

import mongoose from "mongoose";

const UserTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: String,
  refreshToken: String,
  expiryDate: Number,
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

export default UserToken;

// const mongoose = require("mongoose");

// const UserTokenSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   accessToken: String,
//   refreshToken: String,
//   expiryDate: Number,
// });

// module.exports = mongoose.model("UserToken", UserTokenSchema);

// import mongoose from 'mongoose';

// const UserTokensSchema = new mongoose.Schema({
//   userId: { type: String, required: true, unique: true },
//   tokens: { type: Object, required: true }, // store tokens as an object
//   updatedAt: { type: Date, default: Date.now },
// });

// const UserTokens = mongoose.model('UserTokens', UserTokensSchema);

// export default UserTokens;
