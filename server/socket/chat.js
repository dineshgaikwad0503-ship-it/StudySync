import Message from "../models/Message.js";
import { roomKey } from "./index.js";

export default function registerChat(io, socket) {
  socket.on("chat:send", async ({ groupId, body }, ack) => {
    try {
      const text = String(body || "").trim().slice(0, 2000);
      if (!text) return ack?.({ ok: false });
      if (!socket.rooms.has(roomKey(groupId))) return ack?.({ ok: false, message: "Join the room first" });

      const saved = await Message.create({ group: groupId, sender: socket.user.id, body: text });
      const payload = {
        _id: saved._id,
        body: saved.body,
        createdAt: saved.createdAt,
        sender: { _id: socket.user.id, name: socket.user.name, avatar: socket.user.avatar },
      };
      io.to(roomKey(groupId)).emit("chat:message", payload);
      ack?.({ ok: true, message: payload });
    } catch {
      ack?.({ ok: false, message: "Could not send message" });
    }
  });

  socket.on("chat:typing", ({ groupId, typing }) => {
    socket.to(roomKey(groupId)).emit("chat:typing", { user: socket.user, typing: Boolean(typing) });
  });
}
