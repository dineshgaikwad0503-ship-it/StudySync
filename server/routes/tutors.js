import { Router } from "express";
import Tutor from "../models/Tutor.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { ah } from "../middleware/error.js";

const router = Router();

/** Public marketplace listing with subject / price filters. */
router.get("/", ah(async (req, res) => {
  const { subject, maxRate } = req.query;
  const filter = { verified: true };
  if (subject) filter.subjects = new RegExp(subject, "i");
  if (maxRate) filter.hourlyRate = { $lte: Number(maxRate) };
  const tutors = await Tutor.find(filter).populate("user", "name avatar").sort({ hourlyRate: 1 });
  res.json(tutors);
}));

router.get("/:id", ah(async (req, res) => {
  const tutor = await Tutor.findById(req.params.id).populate("user", "name avatar");
  if (!tutor) return res.status(404).json({ message: "Tutor not found" });
  res.json(tutor);
}));

/** Create or update my own tutor profile. */
router.put("/me", requireAuth, ah(async (req, res) => {
  const { headline, bio, subjects, hourlyRate, availability } = req.body;
  const tutor = await Tutor.findOneAndUpdate(
    { user: req.user._id },
    { headline, bio, subjects, hourlyRate, availability, user: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await User.findByIdAndUpdate(req.user._id, { isTutor: true });
  res.json(tutor);
}));

export default router;
