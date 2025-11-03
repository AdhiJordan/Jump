import mongoose from "mongoose";

const EmailMappingSchema = new mongoose.Schema({
  emailId: { type: String, required: true, index: true },
  threadId: { type: String },
  userId: { type: String, required: true, index: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subject: { type: String },
  from: { type: String },
  snippet: { type: String },
  body: { type: String },
  summary: { type: String },
  labels: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmailMapping", EmailMappingSchema);
