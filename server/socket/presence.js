/**
 * Room presence + WebRTC signalling.
 *
 * Video uses PeerJS on the client: each peer registers its PeerJS id here and we
 * relay it to the room so the others can call it. Swapping PeerJS for Agora or
 * Daily.co only changes the client — the relay below stays the same.
 */
import { roomKey } from "./index.js";

export default function registerPresence(io, socket) {
  socket.on("presence:who", async (groupId, ack) => {
    const sockets = await io.in(roomKey(groupId)).fetchSockets();
    ack?.(sockets.map((s) => ({ ...s.user, peerId: s.data.peerId ?? null })));
  });

  socket.on("video:register", ({ groupId, peerId }) => {
    socket.data.peerId = peerId;
    socket.to(roomKey(groupId)).emit("video:peer-joined", { user: socket.user, peerId });
  });

  socket.on("video:leave", ({ groupId }) => {
    socket.to(roomKey(groupId)).emit("video:peer-left", { user: socket.user, peerId: socket.data.peerId });
    socket.data.peerId = null;
  });
}
