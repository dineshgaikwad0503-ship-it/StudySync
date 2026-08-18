// StudySync chat real-time module
export function registerChat(io, socket) {
  return { io, socket, module: "chat" };
}
