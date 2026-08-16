import { io } from "socket.io-client";
import { API_BASE, getToken } from "./api.js";

let socket;

/** One shared authenticated socket for the whole app. */
export function getSocket() {
  if (!socket) {
    socket = io(API_BASE, {
      auth: { token: getToken() },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function resetSocket() {
  socket?.disconnect();
  socket = undefined;
}
