/**
 * Socket.io bootstrap.
 * Every real-time concern lives in this folder:
 *   chat.js        -> group messaging
 *   whiteboard.js  -> collaborative canvas drawing
 *   quiz.js        -> live quiz + leaderboard pushes
 *   presence.js    -> who is in the room + WebRTC signalling
 */
import { Server } from "socket.io";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

import registerChat from "./chat.js";
import registerWhiteboard from "./whiteboard.js";
import registerQuiz from "./quiz.js";
import registerPresence from "./presence.js";

export const roomKey = (groupId) => `group:${groupId}`;

let io;
export const getIO = () => io;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN?.split(",") ?? "*", credentials: true },
    // Real-time hosts behind a load balancer need sticky sessions for polling.
    transports: ["websocket", "polling"],
  });

  // --- Handshake auth: the JWT is required before any event is accepted. ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));
      const { id } = verifyToken(token);
      const user = await User.findById(id).select("name avatar email");
      if (!user) return next(new Error("Unknown user"));
      socket.user = { id: user._id.toString(), name: user.name, avatar: user.avatar };
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    /** Join a study room only after verifying group membership. */
    socket.on("room:join", async (groupId, ack) => {
      try {
        const group = await Group.findById(groupId).select("members name");
        const member = group?.members.some((m) => m.user.toString() === socket.user.id);
        if (!member) return ack?.({ ok: false, message: "Not a member of this group" });

        socket.join(roomKey(groupId));
        socket.data.groupId = groupId;
        ack?.({ ok: true, room: group.name });
        socket.to(roomKey(groupId)).emit("presence:joined", socket.user);
      } catch {
        ack?.({ ok: false, message: "Could not join room" });
      }
    });

    socket.on("room:leave", (groupId) => {
      socket.leave(roomKey(groupId));
      socket.to(roomKey(groupId)).emit("presence:left", socket.user);
    });

    registerChat(io, socket);
    registerWhiteboard(io, socket);
    registerQuiz(io, socket);
    registerPresence(io, socket);

    socket.on("disconnect", () => {
      const groupId = socket.data.groupId;
      if (groupId) socket.to(roomKey(groupId)).emit("presence:left", socket.user);
    });
  });

  // Optional horizontal scaling.
  if (process.env.REDIS_URL) attachRedisAdapter(io).catch(console.error);

  return io;
}

async function attachRedisAdapter(ioInstance) {
  const { createAdapter } = await import("@socket.io/redis-adapter");
  const { createClient } = await import("redis");
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  ioInstance.adapter(createAdapter(pub, sub));
  console.log("Socket.io Redis adapter enabled");
}
