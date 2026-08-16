import { Router } from "express";
import { customAlphabet } from "nanoid";
import Group from "../models/Group.js";
import Message from "../models/Message.js";
import { requireAuth } from "../middleware/auth.js";
import { requireMember, requireOwner } from "../middleware/membership.js";
import { ah } from "../middleware/error.js";

const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);
const router = Router();
router.use(requireAuth);

/** All groups the caller belongs to. */
router.get("/", ah(async (req, res) => {
  const groups = await Group.find({ "members.user": req.user._id })
    .sort({ updatedAt: -1 })
    .populate("members.user", "name email avatar");
  res.json(groups);
}));

router.post("/", ah(async (req, res) => {
  const { name, subject, description } = req.body;
  if (!name) return res.status(400).json({ message: "Group name required" });
  const group = await Group.create({
    name, subject, description,
    inviteCode: nano(),
    members: [{ user: req.user._id, role: "owner" }],
  });
  res.status(201).json(group);
}));

/** Join through the unique invite link: /join/:code */
router.post("/join/:code", ah(async (req, res) => {
  const group = await Group.findOne({ inviteCode: req.params.code.toUpperCase() });
  if (!group) return res.status(404).json({ message: "Invalid invite code" });
  const already = group.members.some((m) => m.user.toString() === req.user._id.toString());
  if (!already) {
    group.members.push({ user: req.user._id, role: "member" });
    await group.save();
  }
  res.json(group);
}));

router.get("/:groupId", requireMember, ah(async (req, res) => {
  await req.group.populate("members.user", "name email avatar");
  res.json({ group: req.group, role: req.role });
}));

router.patch("/:groupId", requireMember, requireOwner, ah(async (req, res) => {
  const { name, subject, description } = req.body;
  Object.assign(req.group, { name, subject, description });
  await req.group.save();
  res.json(req.group);
}));

router.post("/:groupId/rotate-invite", requireMember, requireOwner, ah(async (req, res) => {
  req.group.inviteCode = nano();
  await req.group.save();
  res.json({ inviteCode: req.group.inviteCode });
}));

router.delete("/:groupId/members/:userId", requireMember, requireOwner, ah(async (req, res) => {
  req.group.members = req.group.members.filter((m) => m.user.toString() !== req.params.userId);
  await req.group.save();
  res.json({ ok: true });
}));

router.delete("/:groupId", requireMember, requireOwner, ah(async (req, res) => {
  await req.group.deleteOne();
  res.json({ ok: true });
}));

/** Chat history for the room (live messages arrive over Socket.io). */
router.get("/:groupId/messages", requireMember, ah(async (req, res) => {
  const messages = await Message.find({ group: req.params.groupId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("sender", "name avatar");
  res.json(messages.reverse());
}));

export default router;
