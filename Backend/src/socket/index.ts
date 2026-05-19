import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HttpServer): void => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowed = process.env.CLIENT_URL?.replace(/\/$/, ""); // Remove trailing slash
        
        const isCustomDomain = origin && (origin.endsWith("pulseboard.saurabhjagtap.tech") || origin === "http://localhost:5173");

        if (!origin || origin === allowed || origin.endsWith(".vercel.app") || isCustomDomain) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked by Socket.io. Origin: ${origin}`));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
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