import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    headline: { type: String, required: true },
    bio: String,
    subjects: [String],
    hourlyRate: { type: Number, required: true, min: 0 },
    verified: { type: Boolean, default: false },
    // Weekly availability, e.g. { day: 1 (Mon), start: "16:00", end: "20:00" }
    availability: [
      { day: Number, start: String, end: String, _id: false },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Tutor", tutorSchema);
