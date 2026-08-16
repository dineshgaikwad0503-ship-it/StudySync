import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: String,
    description: String,
    inviteCode: { type: String, required: true, unique: true, index: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
