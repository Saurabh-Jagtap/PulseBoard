import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin:  process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // frontend calls this to start receiving live updates for a poll
    socket.on("join-poll", (pollId: string) => {
      socket.join(`poll:${pollId}`);
    });

    socket.on("leave-poll", (pollId: string) => {
      socket.leave(`poll:${pollId}`);
    });
  });
};

export const emitNewResponse = (pollId: string, payload: unknown): void => {
  io?.to(`poll:${pollId}`).emit("response:new", payload);
};