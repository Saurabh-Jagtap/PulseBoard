import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export const useSocket = (pollId: string, onNewResponse: (data: { totalResponses: number }) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"], // 1. Skip polling, go straight to WebSockets
      withCredentials: true,    // 2. Allow cookies/headers to pass through
    });

    // const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.emit("join-poll", pollId);
    socket.on("response:new", onNewResponse);

    return () => {
      socket.emit("leave-poll", pollId);
      socket.disconnect();
    };
  }, [pollId]);
};