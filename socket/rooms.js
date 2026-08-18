// StudySync rooms real-time module
export function registerRooms(io, socket) {
  return { io, socket, module: "rooms" };
}
