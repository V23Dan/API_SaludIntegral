import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  usuario: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
      context: { type: String },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;