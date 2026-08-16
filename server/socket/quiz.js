import mongoose from "mongoose";
import Score from "../models/Score.js";
import { roomKey } from "./index.js";

/** Live quiz sessions: host starts, everyone answers, leaderboard updates live. */
export default function registerQuiz(io, socket) {
  socket.on("quiz:start", ({ groupId, quizId, title }) => {
    if (!socket.rooms.has(roomKey(groupId))) return;
    io.to(roomKey(groupId)).emit("quiz:started", { quizId, title, host: socket.user });
  });

  socket.on("quiz:progress", ({ groupId, quizId, index }) => {
    socket.to(roomKey(groupId)).emit("quiz:progress", { quizId, index, user: socket.user });
  });

  /** Called after the REST submit so peers see the leaderboard move instantly. */
  socket.on("quiz:finished", async ({ groupId, quizId }) => {
    if (!socket.rooms.has(roomKey(groupId))) return;
    const rows = await Score.aggregate([
      { $match: { group: new mongoose.Types.ObjectId(groupId) } },
      { $group: { _id: "$user", points: { $sum: "$points" } } },
      { $sort: { points: -1 } },
      { $limit: 25 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { points: 1, "user.name": 1 } },
    ]);
    io.to(roomKey(groupId)).emit("quiz:leaderboard", { quizId, rows, by: socket.user });
  });
}
