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
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
      auth: { token: session.access_token },
    });

    console.log("🔌 creating socket");

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    setSocket(s);

    return () => {
      console.log("🧹 destroying socket");
      s.disconnect();
    };
  }, [loading, session?.access_token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
