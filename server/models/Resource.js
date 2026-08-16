import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    mimeType: String,
    size: Number,
    storage: { type: String, enum: ["s3", "local"], default: "s3" },
    key: { type: String, required: true }, // S3 object key or local relative path
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);
