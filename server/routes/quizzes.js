import { Router } from "express";
import Quiz from "../models/Quiz.js";
import Score from "../models/Score.js";
import { requireAuth } from "../middleware/auth.js";
import { requireMember } from "../middleware/membership.js";
import { ah } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

router.get("/:groupId", requireMember, ah(async (req, res) => {
  const quizzes = await Quiz.find({ group: req.params.groupId })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name");
  res.json(quizzes);
}));

router.post("/:groupId", requireMember, ah(async (req, res) => {
  const { title, mode, questions } = req.body;
  if (!title || !Array.isArray(questions) || questions.length === 0)
    return res.status(400).json({ message: "Title and at least one question required" });
  const quiz = await Quiz.create({
    group: req.params.groupId, createdBy: req.user._id, title, mode, questions,
  });
  res.status(201).json(quiz);
}));

/** Questions without the answer key — prevents cheating from the network tab. */
router.get("/play/:quizId", ah(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  req.params.groupId = quiz.group.toString();
  requireMember(req, res, () => {
    res.json({
      _id: quiz._id, title: quiz.title, mode: quiz.mode, group: quiz.group,
      questions: quiz.questions.map((q) => ({ prompt: q.prompt, options: q.options })),
    });
  });
}));

/** Grade on the server, store the score, return the fresh leaderboard. */
router.post("/play/:quizId/submit", ah(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });
  req.params.groupId = quiz.group.toString();
  requireMember(req, res, async () => {
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    let correct = 0;
    const review = quiz.questions.map((q, i) => {
      const ok = answers[i] === q.correctIndex;
      if (ok) correct += 1;
      return { prompt: q.prompt, correctIndex: q.correctIndex, given: answers[i] ?? null, ok, explanation: q.explanation };
    });

    await Score.create({
      quiz: quiz._id, group: quiz.group, user: req.user._id,
      correct, total: quiz.questions.length, points: correct * 10,
    });

    res.json({ correct, total: quiz.questions.length, review });
  });
}));

/** Group leaderboard — total points across every quiz. */
router.get("/:groupId/leaderboard", requireMember, ah(async (req, res) => {
  const rows = await Score.aggregate([
    { $match: { group: req.group._id } },
    { $group: { _id: "$user", points: { $sum: "$points" }, attempts: { $sum: 1 }, correct: { $sum: "$correct" } } },
    { $sort: { points: -1 } },
    { $limit: 25 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { points: 1, attempts: 1, correct: 1, "user.name": 1, "user.avatar": 1 } },
  ]);
  res.json(rows);
}));

export default router;
