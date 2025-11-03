import mongoose from "mongoose";

const EmailMappingSchema = new mongoose.Schema({
  // Gmail message ID (unique per message)
  emailId: { type: String, required: true, index: true },

  // Gmail thread ID (optional, for threading features)
  threadId: { type: String },

  // The user this email belongs to (Google account)
  userId: { type: String, required: true, index: true },

  // The assigned category (reference or just ID)
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  // Main email fields for display
  subject: { type: String },
  from: { type: String },
  snippet: { type: String }, // Gmail API snippet
  body: { type: String }, // Extracted plain text or stripped HTML

  // AI summary stored after classification
  summary: { type: String },

  // Gmail labels assigned (optional)
  labels: [{ type: String }],

  // Timestamp when mapping/assignment was created
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmailMapping", EmailMappingSchema);
