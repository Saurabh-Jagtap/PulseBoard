import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowed = process.env.CLIENT_URL?.replace(/\/$/, ""); // Remove trailing slash
        if (!origin || origin === allowed || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error("CORS blocked by Socket.io"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
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