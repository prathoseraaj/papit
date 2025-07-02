import { io, Socket } from "socket.io-client";
import { User } from "../components/InputField"; 

let socket: Socket | null = null;

export function getSocket(room: string, user: User) {
  if (!socket) {
    socket = io({
      path: "/api/socket/socket",
      query: { room, user: JSON.stringify(user) },
    });
  }
  return socket;
}