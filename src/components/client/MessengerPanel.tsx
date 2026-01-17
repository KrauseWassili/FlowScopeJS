import { useEffect, useRef, useState } from "react";

type MessengerPanelProps = {
  selfId: string;
  peerId: string;
  messages: Message[];
  onSend: (text: string) => void;
};

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp?: string;
};


export default function MessengerPanel({
  selfId,
  peerId,
  messages,
  onSend,
}: MessengerPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2 flex flex-col space-y-2">
        <div className="flex-1" />
        {[...messages].map((msg) => {

          const isSelf = msg.from === selfId;
          return (
            <div
              key={msg.id}
              className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow
                  ${
                    isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }
                `}
                title={msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
              >
                <div className="text-sm">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 pt-2 m-2 mb-10">
        <input
          className="input"
          placeholder="Enter message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
        />
        <button
          className="btn bg-active! text-accent!"
          onClick={() => {
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
