import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: (v) => v.length >= 2 && v.length <= 6,
    },
    correctIndex: { type: Number, required: true },
    explanation: String,
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    mode: { type: String, enum: ["flashcards", "mcq"], default: "mcq" },
    questions: [questionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
