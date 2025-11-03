import mongoose from "mongoose";

const UserTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  accessToken: String,
  refreshToken: String,
  expiryDate: Number,
});

const UserToken = mongoose.model("UserToken", UserTokenSchema);

export default UserToken;
