/**
 * Collaborative whiteboard broadcasting.
 *
 * The client sends normalised coordinates (0..1) so every peer renders the same
 * stroke regardless of canvas size. We only relay — the canvas is the source of
 * truth on each client — plus we keep a bounded in-memory history so that a user
 * who joins late receives the current board state.
 *
 * Events
 *   wb:stroke {groupId, stroke}  -> broadcast a completed segment (moveTo/lineTo)
 *   wb:clear  {groupId}          -> wipe the board for everyone
 *   wb:sync   groupId (ack)      -> replay history to a newly joined client
 */
import { roomKey } from "./index.js";

const MAX_HISTORY = 5000;
/** groupId -> array of stroke segments */
const history = new Map();

function push(groupId, stroke) {
  const list = history.get(groupId) ?? [];
  list.push(stroke);
  if (list.length > MAX_HISTORY) list.splice(0, list.length - MAX_HISTORY);
  history.set(groupId, list);
}

function sanitize(stroke, user) {
  const num = (n) => (typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);
  return {
    from: { x: num(stroke?.from?.x), y: num(stroke?.from?.y) }, // moveTo
    to: { x: num(stroke?.to?.x), y: num(stroke?.to?.y) },       // lineTo
    color: typeof stroke?.color === "string" ? stroke.color.slice(0, 24) : "#111827",
    width: Math.min(40, Math.max(1, Number(stroke?.width) || 3)),
    erase: Boolean(stroke?.erase),
    by: user.id,
  };
}

export default function registerWhiteboard(io, socket) {
  socket.on("wb:sync", (groupId, ack) => {
    ack?.({ ok: true, strokes: history.get(groupId) ?? [] });
  });

  socket.on("wb:stroke", ({ groupId, stroke }) => {
    if (!socket.rooms.has(roomKey(groupId))) return;
    const clean = sanitize(stroke, socket.user);
    push(groupId, clean);
    // Broadcast to everyone except the author (who already drew it locally).
    socket.to(roomKey(groupId)).emit("wb:stroke", clean);
  });

  /** Batched strokes keep the socket quiet during fast drawing. */
  socket.on("wb:strokes", ({ groupId, strokes }) => {
    if (!socket.rooms.has(roomKey(groupId)) || !Array.isArray(strokes)) return;
    const clean = strokes.slice(0, 200).map((s) => sanitize(s, socket.user));
    clean.forEach((s) => push(groupId, s));
    socket.to(roomKey(groupId)).emit("wb:strokes", clean);
  });

  socket.on("wb:clear", ({ groupId }) => {
    if (!socket.rooms.has(roomKey(groupId))) return;
    history.set(groupId, []);
    io.to(roomKey(groupId)).emit("wb:clear", { by: socket.user });
  });

  socket.on("wb:cursor", ({ groupId, x, y }) => {
    socket.to(roomKey(groupId)).emit("wb:cursor", { user: socket.user, x, y });
  });
}
