import { Router } from "express";
import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";
import { requireAuth } from "../middleware/auth.js";
import { ah } from "../middleware/error.js";

const router = Router();
const SLOT_MINUTES = 60;

/** Free slots for a tutor on a given ISO date, derived from weekly availability. */
router.get("/availability/:tutorId", ah(async (req, res) => {
  const tutor = await Tutor.findById(req.params.tutorId);
  if (!tutor) return res.status(404).json({ message: "Tutor not found" });

  const date = new Date(req.query.date || Date.now());
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);

  const windows = tutor.availability.filter((a) => a.day === dayStart.getDay());
  const slots = [];
  for (const w of windows) {
    const [sh, sm] = w.start.split(":").map(Number);
    const [eh, em] = w.end.split(":").map(Number);
    const cursor = new Date(dayStart); cursor.setHours(sh, sm, 0, 0);
    const end = new Date(dayStart); end.setHours(eh, em, 0, 0);
    while (cursor.getTime() + SLOT_MINUTES * 60000 <= end.getTime()) {
      slots.push(new Date(cursor));
      cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
    }
  }

  const taken = await Booking.find({
    tutor: tutor._id, status: "booked", startsAt: { $gte: dayStart, $lt: dayEnd },
  }).select("startsAt");
  const takenSet = new Set(taken.map((b) => b.startsAt.getTime()));

  res.json(slots.filter((s) => !takenSet.has(s.getTime()) && s > new Date()));
}));

router.use(requireAuth);

/** Book a slot. Overlap check + a unique index make double-booking impossible. */
router.post("/", ah(async (req, res) => {
  const { tutorId, startsAt, notes } = req.body;
  const tutor = await Tutor.findById(tutorId);
  if (!tutor) return res.status(404).json({ message: "Tutor not found" });

  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return res.status(400).json({ message: "Invalid start time" });
  if (start < new Date()) return res.status(400).json({ message: "Cannot book a past slot" });
  const end = new Date(start.getTime() + SLOT_MINUTES * 60000);

  const clash = await Booking.findOne({
    tutor: tutor._id, status: "booked",
    startsAt: { $lt: end }, endsAt: { $gt: start },
  });
  if (clash) return res.status(409).json({ message: "That slot has just been taken" });

  try {
    const booking = await Booking.create({
      tutor: tutor._id, student: req.user._id, startsAt: start, endsAt: end,
      priceUsd: tutor.hourlyRate, notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That slot has just been taken" });
    throw err;
  }
}));

router.get("/me", ah(async (req, res) => {
  const bookings = await Booking.find({ student: req.user._id })
    .sort({ startsAt: 1 })
    .populate({ path: "tutor", populate: { path: "user", select: "name avatar" } });
  res.json(bookings);
}));

router.patch("/:id/cancel", ah(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.student.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not your booking" });
  booking.status = "cancelled";
  await booking.save();
  res.json(booking);
}));

export default router;
