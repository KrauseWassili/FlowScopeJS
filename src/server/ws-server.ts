import { sendTraceEvent } from "./lib/trace/sendTraceEvent";

import { createServer } from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

/* =========================
   ENV CHECK
========================= */

console.log("ENV CHECK:", {
  redisHost: process.env.REDIS_HOST,
  clientOrigin: process.env.CLIENT_ORIGIN,
});

/* =========================
   Redis
========================= */

const redisHost = (process.env.REDIS_HOST as string) || "localhost";
const redisPort = +(process.env.REDIS_PORT || 6379);

const redisChat = new Redis(redisPort, redisHost);
const redisObs = new Redis(redisPort, redisHost);

/* =========================
   HTTP + Socket.IO
========================= */

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  },
});

/* =========================
   OBSERVABILITY (Redis Streams)
========================= */

const STREAM = "system-events";
const GROUP = "ws-group";
const CONSUMER = "ws-1";

async function ensureGroup() {
  try {
    await redisObs.xgroup("CREATE", STREAM, GROUP, "0", "MKSTREAM");
    console.log("✅ Redis consumer group created");
  } catch (e: any) {
    if (!String(e.message).includes("BUSYGROUP")) {
      console.error("❌ XGROUP ERROR:", e.message);
      throw e;
    }
  }
}

function mapFields(fields: any[]): any {
  const obj: any = {};
  for (let i = 0; i < fields.length; i += 2) {
    obj[fields[i]] = fields[i + 1];
  }
  if (obj.event) {
    try {
      return JSON.parse(obj.event);
    } catch {
      return obj.event;
    }
  }
  return obj;
}

async function startObservabilityConsumer() {
  await ensureGroup();
  console.log("🚀 Observability Redis consumer started");

  while (true) {
    try {
      const res = await (redisObs as any).xreadgroup(
        "GROUP",
        GROUP,
        CONSUMER,
        "BLOCK",
        0,
        "COUNT",
        10,
        "STREAMS",
        STREAM,
        ">"
      );

      if (!res) continue;

      for (const [, events] of res as any) {
        for (const [id, fields] of events as any) {
          const event = mapFields(fields) as any;

          console.log("[WS][OBS] EMIT", event.type, event);

          io.emit("system:event", event);

          await redisObs.xack(STREAM, GROUP, id);
        }
      }
    } catch (err: any) {
      console.error("❌ Observability loop error:", err);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

/* =========================
   Socket auth middleware
========================= */

io.use((socket: any, next: any) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("WS AUTH: NO TOKEN");
    return next(new Error("No token"));
  }

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.sub) {
    console.log("WS AUTH: INVALID TOKEN");
    return next(new Error("Invalid token"));
  }

  socket.data.userId = decoded.sub;
  console.log("WS JWT OK:", decoded.sub);

  next();
});

/* =========================
   SOCKET HANDLERS (MESSENGER)
========================= */

io.on("connection", (socket: any) => {
  const userId = socket.data.userId;
  console.log("Client connected:", userId, socket.id);

  socket.join(userId);

  (async () => {
    try {
      const history = (
        await redisObs.xrevrange("system-events", "+", "-", "COUNT", 20)
      ).reverse();

      const parsedEvents = history.map(([id, fields]: [string, string[]]) => {
        const obj: any = {};
        for (let i = 0; i < fields.length; i += 2) {
          obj[fields[i]] = fields[i + 1];
        }
        return obj.event ? JSON.parse(obj.event) : obj;
      });

      socket.emit("system:history", parsedEvents);
    } catch (err) {
      console.error("Ошибка получения истории для клиента:", err);
    }
  })();

  socket.on(
    "message:send",
    async ({
      to,
      text,
      trace,
    }: {
      to: string;
      text: string;
      trace?: { traceId: string };
    }) => {
      // Используем traceId/type
      const traceId = trace?.traceId || crypto.randomUUID();
      const type = "MESSAGE";
      if (!to || !text) {
        await sendTraceEvent({
          traceId,
          type,
          node: "ws",
          actorId: userId,
          dialogId: to ? `${userId}:${to}` : undefined,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: { message: "Missing 'to' or 'text' in message" },
        });
        return;
      }

      try {
        await sendTraceEvent({
          traceId,
          type,
          node: "ws",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "success",
          timestamp: Date.now(),
          payload: { text: "Server" },
        });

        const timestamp = new Date().toISOString();

        let id;
        try {
          id = await redisChat.xadd(
            "messages",
            "*",
            "from",
            userId,
            "to",
            to,
            "text",
            text,
            "timestamp",
            timestamp
          );

          await sendTraceEvent({
            traceId,
            type,
            node: "redis",
            actorId: userId,
            dialogId: `${userId}:${to}`,
            outcome: "success",
            timestamp: Date.now(),
            payload: { text },
          });
        } catch (redisErr: any) {
          await sendTraceEvent({
            traceId,
            type,
            node: "redis",
            actorId: userId,
            dialogId: `${userId}:${to}`,
            outcome: "error",
            timestamp: Date.now(),
            payload: { text },
            error: {
              message: redisErr.message,
            },
          });
          throw redisErr;
        }

        const message = { id, from: userId, to, text, timestamp };

        try {
          io.to(userId).emit("message:new", message);
          io.to(to).emit("message:new", message);

          await sendTraceEvent({
            traceId,
            type,
            node: "client_2",
            actorId: userId,
            dialogId: `${userId}:${to}`,
            outcome: "success",
            timestamp: Date.now(),
            payload: { text },
          });
        } catch (emitErr: any) {
          await sendTraceEvent({
            traceId,
            type,
            node: "client_receive",
            actorId: userId,
            dialogId: `${userId}:${to}`,
            outcome: "error",
            timestamp: Date.now(),
            payload: { text },
            error: {
              message: emitErr.message,
            },
          });
        }
      } catch (err: any) {
        await sendTraceEvent({
          traceId,
          type,
          node: "ws",
          actorId: userId,
          dialogId: `${userId}:${to}`,
          outcome: "error",
          timestamp: Date.now(),
          payload: { text },
          error: {
            message: err.message,
          },
        });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", userId);
  });
});

/* =========================
   START SERVER
========================= */

const PORT = +(process.env.WS_PORT || 4000);

httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server listening on port ${PORT}`);
  startObservabilityConsumer().catch((err: any) => {
    console.error("❌ Observability consumer failed:", err);
  });
});

/* =========================
   GRACEFUL SHUTDOWN
========================= */

process.on("SIGINT", async () => {
  console.log("🛑 Shutting down WS server...");
  await redisChat.quit();
  await redisObs.quit();
  process.exit(0);
});
