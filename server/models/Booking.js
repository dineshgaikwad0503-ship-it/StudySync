import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ["booked", "cancelled", "completed"], default: "booked" },
    priceUsd: Number,
    notes: String,
  },
  { timestamps: true }
);

// Hard guarantee against double-booking the exact same slot.
bookingSchema.index({ tutor: 1, startsAt: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
