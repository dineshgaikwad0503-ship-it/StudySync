import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Resource from "../models/Resource.js";
import { requireAuth } from "../middleware/auth.js";
import { requireMember } from "../middleware/membership.js";
import { ah } from "../middleware/error.js";
import { s3Enabled, uploadBuffer, signedDownloadUrl, deleteObject } from "../config/s3.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new Error("Unsupported file type")),
});

const router = Router();
router.use(requireAuth);

/** List the group's shared drive — members only. */
router.get("/:groupId", requireMember, ah(async (req, res) => {
  const files = await Resource.find({ group: req.params.groupId })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name avatar");
  res.json(files);
}));

router.post("/:groupId", requireMember, upload.single("file"), ah(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const safeName = req.file.originalname.replace(/[^\w.\-]/g, "_");
  const key = `groups/${req.params.groupId}/${Date.now()}-${safeName}`;

  if (s3Enabled) {
    await uploadBuffer(key, req.file.buffer, req.file.mimetype);
  } else {
    const dest = path.join(UPLOAD_DIR, key);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, req.file.buffer);
  }

  const resource = await Resource.create({
    group: req.params.groupId,
    uploadedBy: req.user._id,
    filename: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    storage: s3Enabled ? "s3" : "local",
    key,
  });
  res.status(201).json(resource);
}));

/** Private download: presigned S3 URL (5 min) or a local stream. */
router.get("/file/:id", ah(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "File not found" });
  req.params.groupId = resource.group.toString();
  requireMember(req, res, async () => {
    if (resource.storage === "s3") {
      return res.json({ url: await signedDownloadUrl(resource.key) });
    }
    res.json({ url: `/uploads/${resource.key}` });
  });
}));

router.delete("/file/:id", ah(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: "File not found" });
  req.params.groupId = resource.group.toString();
  requireMember(req, res, async () => {
    const isUploader = resource.uploadedBy.toString() === req.user._id.toString();
    if (!isUploader && req.role !== "owner")
      return res.status(403).json({ message: "Not allowed" });
    if (resource.storage === "s3") await deleteObject(resource.key);
    else fs.rmSync(path.join(UPLOAD_DIR, resource.key), { force: true });
    await resource.deleteOne();
    res.json({ ok: true });
  });
}));

export default router;
