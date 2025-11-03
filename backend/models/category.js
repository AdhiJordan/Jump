import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
  userId: String,
  name: String,
  description: String,
});
export default mongoose.model("Category", CategorySchema);
