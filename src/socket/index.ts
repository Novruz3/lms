import { Server } from "socket.io";
import { JWT_SECRET } from "../secrets";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  io.use((socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const payload = jwt.verify(token, JWT_SECRET) as any;
      socket.user = payload;
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });
  io.on("connection", (socket: any) => {
    console.log("User connected:", socket.id);
    socket.join(`user-${socket.user.userId}`);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};
