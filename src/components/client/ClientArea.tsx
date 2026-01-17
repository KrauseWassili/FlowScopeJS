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
  timestamp?: string;
};

export default function ClientArea() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState<Profile[]>([]);
  const [tab, setTab] = useState<"messenger" | "auth">("messenger");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [messagesByPeer, setMessagesByPeer] = useState<
    Record<string, Message[]>
  >({});

  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (msg: Message) => {
      const peer = msg.from === user.id ? msg.to : msg.from;

      setMessagesByPeer((prev) => ({
        ...prev,
        [peer]: [...(prev[peer] ?? []), msg],
      }));
    };

    const onDialogHistory = ({
      peerId,
      messages,
    }: {
      peerId: string;
      messages: Message[];
    }) => {
      setMessagesByPeer((prev) => ({
        ...prev,
        [peerId]: messages,
      }));
    };

    const onDialogCleared = ({ peerId }: { peerId: string }) => {
      setMessagesByPeer((prev) => ({
        ...prev,
        [peerId]: [],
      }));
    };

    socket.on("message:new", onNewMessage);
    socket.on("dialog:history", onDialogHistory);
    socket.on("dialog:cleared", onDialogCleared);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("dialog:history", onDialogHistory);
      socket.off("dialog:cleared", onDialogCleared);
    };
  }, [socket, user]);

  useEffect(() => {
    if (socket && peerId) {
      socket.emit("dialog:open", { peerId });
    }
  }, [socket, peerId]);

  useEffect(() => {
    if (!user) {
      setPeerId(null);
      setMessagesByPeer({});
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(() => {
      const traceId = crypto.randomUUID();
      const type = "USER_SELECT";

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

  const visibleMessages = peerId ? messagesByPeer[peerId] ?? [] : [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex gap-2 border-border border-b p-4 shrink-0 bg-panel">
        <button onClick={() => setTab("messenger")} className="btn">
          Messenger
        </button>

        {user && (
          <PeerSelect
            users={users}
            value={peerId}
            onChange={(id) => {
              setPeerId(id);
              socket?.emit("dialog:open", { peerId: id });
            }}
          />
        )}
        <UserStatus onSetTab={() => setTab("auth")} />
        {peerId && (
          <button
            className="btn border-attention!"
            onClick={() => {
              if (peerId && confirm("Clear this chat?")) {
                socket?.emit("dialog:clear", { peerId });
              }
            }}
          >
            Clear chat
          </button>
        )}
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

        {tab === "auth" && <AuthPanel setTab = {setTab}/>}
      </div>
    </div>
  );
}
