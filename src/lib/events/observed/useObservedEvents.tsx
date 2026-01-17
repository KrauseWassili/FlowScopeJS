// import { useEffect, useRef, useState } from "react";
// import { TraceEvent } from "@/lib/trace/sсhemas";
// import { useSocket } from "@/context/SocketContext";

// export function useObservedEvents() {
//   const { socket } = useSocket();
//   const [events, setEvents] = useState<TraceEvent[]>([]);
//   const clearedAtRef = useRef<number>(0);

//   useEffect(() => {
//     if (!socket) return;

//     const onHistory = (history: TraceEvent[]) => {
//       console.log("[OBS] system:history", history.length);
//       setEvents([...history]); // новая ссылка
//     };

//     const onEvent = (event: TraceEvent) => {
//       if (event.timestamp <= clearedAtRef.current) return;

//       setEvents((prev) => {
//         const isDuplicate = prev.some(
//           (e) =>
//             e.traceId === event.traceId &&
//             e.node === event.node &&
//             e.timestamp === event.timestamp
//         );
//         return isDuplicate ? prev : [...prev, event];
//       });
//     };

//     const onCleared = () => {
//       console.log("[OBS] system:cleared");
//       clearedAtRef.current = Date.now();
//       setEvents([]);
//     };

//     socket.on("system:history", onHistory);
//     socket.on("system:event", onEvent);
//     socket.on("system:cleared", onCleared);

//     return () => {
//       socket.off("system:history", onHistory);
//       socket.off("system:event", onEvent);
//       socket.off("system:cleared", onCleared);
//     };
//   }, [socket]);

//   const clearEvents = () => {
//     socket?.emit("system:clear");
//     console.log("[OBS] emit system:clear");
//   };

//   return { events, clearEvents };
// }
