// StudySync whiteboard real-time module
export function registerWhiteboard(io, socket) {
  return { io, socket, module: "whiteboard" };
}
