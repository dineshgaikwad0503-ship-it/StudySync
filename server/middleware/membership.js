import Group from "../models/Group.js";

/** Guarantees the caller belongs to :groupId before any resource is exposed. */
export async function requireMember(req, res, next) {
  const groupId = req.params.groupId || req.body.group || req.query.group;
  if (!groupId) return res.status(400).json({ message: "group id required" });

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  const uid = req.user._id.toString();
  const isMember = group.members.some((m) => m.user.toString() === uid);
  if (!isMember) return res.status(403).json({ message: "You are not a member of this group" });

  req.group = group;
  req.role = group.members.find((m) => m.user.toString() === uid).role;
  next();
}

export function requireOwner(req, res, next) {
  if (req.role !== "owner") return res.status(403).json({ message: "Owner only" });
  next();
}
