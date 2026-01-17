"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { TraceEvent } from "@/lib/trace/sсhemas";

type SocketCtx = {
  socket: Socket | null;
  events: TraceEvent[];
  clearEvents: () => void;
};

const SocketContext = createContext<SocketCtx | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const clearedAtRef = useRef(0);

  useEffect(() => {
    if (loading) return;

    // logout → всё сбрасываем
    if (!session?.access_token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      setEvents([]);
      return;
    }

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
      auth: { token: session.access_token },
    });

    console.log("🔌 creating socket");

    s.on("system:history", (history: TraceEvent[]) => {
      setEvents([...history]); // новая ссылка
    });

    s.on("system:event", (event: TraceEvent) => {
      if (event.timestamp <= clearedAtRef.current) return;
      setEvents((prev) => [...prev, event]);
    });

    s.on("system:cleared", () => {
      clearedAtRef.current = Date.now();
      setEvents([]);
      console.log("setEvents[]");
    });

    setSocket(s);

    return () => {
      console.log("🧹 destroying socket");
      s.disconnect();
    };
  }, [loading, session?.access_token]);

  const clearEvents = () => {
    // 🔥 МГНОВЕННО чистим локальный UI
    clearedAtRef.current = Date.now();
    setEvents([]);
    console.log("setEvents[] (local)");

    // 🔁 асинхронно сообщаем серверу
    socket?.emit("system:clear");
  };

  const value = useMemo(
    () => ({ socket, events, clearEvents }),
    [socket, events]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return ctx;
}
