import { Router } from "express";
import User from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { ah } from "../middleware/error.js";

const router = Router();

router.post("/register", ah(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
  if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post("/login", ah(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

function publicUser(u) {
  return { id: u._id, name: u.name, email: u.email, avatar: u.avatar, isTutor: u.isTutor };
}

export default router;
