"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import MessengerPanel from "./MessengerPanel";
import AuthPanel from "./AuthPanel";
import UserStatus from "./UserStatus";
import { Profile } from "@/lib/auth/profile";
import PeerSelect from "./PeerSelect";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: Date;
};

function parseRedisMsg(raw: any[]): Message {
  const [id, arr] = raw;
  const obj: any = {};
  for (let i = 0; i < arr.length; i += 2) {
    obj[arr[i]] = arr[i + 1];
  }
  return {
    id,
    ...obj,
    timestamp: obj.timestamp ? new Date(obj.timestamp) : new Date(),
  };
}

export default function ClientArea() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState<Profile[]>([]);
  const [peerId, setPeerId] = useState<string | undefined>();
  const [tab, setTab] = useState<"messenger" | "auth">("messenger");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      socket.emit("get_history");
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.once("connect", onConnect);
    }

    const onNewMessage = (msg: any) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, timestamp: new Date(msg.timestamp) },
      ]);
    };

    const onHistory = (rawMsgs: any[]) => {
      setMessages(rawMsgs.map(parseRedisMsg));
    };

    socket.on("message:new", onNewMessage);
    socket.on("message_history", onHistory);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message_history", onHistory);
    };
  }, [socket]);

  const traceIdRef = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      const traceId = crypto.randomUUID();
      const type = "USER_SELECT";

      // sendTraceEvent({
      //   traceId,
      //   type,
      //   node: "client_1",
      //   actorId: user.id,
      //   outcome: "success",
      //   timestamp: Date.now(),
      // });

      fetch(`/api/peers?selfId=${user.id}`, {
        headers: {
          "x-trace-id": traceId,
        },
      })
        .then((res) => res.json())
        .then(setUsers)
        .catch(console.error);
    }, 100);
    return () => clearTimeout(timeout);
  }, [user]);

  const handleSendMessage = (to: string, text: string) => {
    if (!socket || !user) return;

    const traceId = crypto.randomUUID();
    const type = "MESSAGE";

    sendTraceEvent({
      traceId: traceId,
      type: type,
      node: "client_1",
      actorId: user.id,
      dialogId: `${user.id}:${to}`,
      payload: {
        text,
      },
      outcome: "success",
      // outcome: "error",
      timestamp: Date.now(),
    });

    socket.emit("message:send", {
      to,
      text,
      trace: {
        traceId: traceId,
        type: type,
      },
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const selfId = user?.id;

  const visibleMessages = messages.filter(
    (m) =>
      (m.from === selfId && m.to === peerId) ||
      (m.from === peerId && m.to === selfId)
  );

  return (
    <div className="flex-1 flex flex-col border-border border-b min-h-0">
      <div className="flex gap-2 border-border border-b p-4 shrink-0 bg-panel">
        <button onClick={() => setTab("messenger")} className="btn">
          Messenger
        </button>
        <button onClick={() => setTab("auth")} className="btn">
          Login
        </button>

        {user && (
          <PeerSelect users={users} value={peerId} onChange={setPeerId} />
        )}

        <UserStatus />
      </div>

      <div className="flex-1 flex flex-col min-h-0 ">
        {tab === "messenger" &&
          (selfId && peerId ? (
            <MessengerPanel
              selfId={selfId}
              peerId={peerId}
              messages={visibleMessages}
              onSend={(text) => handleSendMessage(peerId, text)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs opacity-60">
              {selfId
                ? "Select a contact to start chatting"
                : "Please log in to use messenger"}
            </div>
          ))}

        {tab === "auth" && <AuthPanel />}
      </div>
    </div>
  );
}
