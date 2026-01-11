"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

type SocketCtx = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketCtx>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!session?.access_token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (socket) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
      auth: {
        token: session.access_token,
      },
    });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket connect_error:", err.message);
    });

    setSocket(s);
  }, [loading, session?.access_token]); 

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
