// StudySync presence real-time module
export function registerPresence(io, socket) {
  return { io, socket, module: "presence" };
}
