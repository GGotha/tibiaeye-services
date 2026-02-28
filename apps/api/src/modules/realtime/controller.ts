import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { WebSocket } from "@fastify/websocket";
import type { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { LicenseKeyEntity } from "../../entities/license-key.entity.js";
import { SessionEntity, SessionStatus } from "../../entities/session.entity.js";
import { COOKIE_NAME } from "../../plugins/cookie.plugin.js";
import {
  joinRoom,
  leaveRoom,
  removeFromAllRooms,
  updateRoomPosition,
  updateRoomStatus,
  broadcastToRoom,
  registerBotSocket,
  getBotSessionId,
  getRoom,
} from "../../shared/realtime/room-manager.js";
import { addPosition, removeSession } from "../../shared/queue/position-buffer.js";
import { getDiscordNotificationQueue } from "../../shared/queue/discord-notification.queue.js";
import { env } from "../../config/env.js";
import { Redis } from "ioredis";
import {
  LOW_HP_DEBOUNCE_SECONDS,
  BOT_STUCK_DEBOUNCE_SECONDS,
} from "../../modules/discord/constants.js";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
});

interface PositionMessage {
  type: "position";
  sessionId: string;
  x: number;
  y: number;
  z: number;
  timestamp: string;
}

interface JoinSessionMessage {
  type: "join-session";
  sessionId: string;
}

interface LeaveSessionMessage {
  type: "leave-session";
  sessionId: string;
}

interface StatusMessage {
  type: "status";
  sessionId: string;
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature?: string;
  currentTask?: string;
  experience?: number;
  level?: number;
  speed?: number;
  stamina?: number;
  capacity?: number;
  timestamp: string;
}

type ClientMessage = PositionMessage | JoinSessionMessage | LeaveSessionMessage | StatusMessage;

export const realtimeController: FastifyPluginAsyncZod = async (app) => {
  const licenseKeyRepo = app.getRepository(LicenseKeyEntity);
  const sessionRepo = app.getRepository(SessionEntity);

  app.get("/", { websocket: true }, async (socket, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get("token");
    const sessionId = url.searchParams.get("session");

    const isBot = !!token?.startsWith("tm_");
    const userId = isBot
      ? await authenticateWithLicenseKey(token, licenseKeyRepo, socket)
      : await authenticateWithJwt(request, app, socket);

    if (!userId) return;

    if (sessionId) {
      const isValid = await validateSessionOwnership(sessionId, userId, sessionRepo);
      if (!isValid) {
        socket.send(JSON.stringify({ type: "error", message: "Invalid session" }));
        socket.close(4003, "Invalid session");
        return;
      }
      joinRoom(socket, sessionId);

      if (isBot) {
        registerBotSocket(socket, sessionId);
      }
    }

    socket.send(JSON.stringify({ type: "connected", userId }));

    socket.on("message", async (rawMessage: Buffer | ArrayBuffer | Buffer[]) => {
      try {
        const message = JSON.parse(rawMessage.toString()) as ClientMessage;

        switch (message.type) {
          case "position": {
            await handlePosition(socket, userId, message, sessionRepo);
            break;
          }
          case "join-session": {
            await handleJoinSession(socket, userId, message.sessionId, sessionRepo);
            break;
          }
          case "leave-session": {
            leaveRoom(socket, message.sessionId);
            socket.send(JSON.stringify({ type: "left-session", sessionId: message.sessionId }));
            break;
          }
          case "status": {
            await handleStatus(socket, userId, message, sessionRepo);
            break;
          }
          default:
            socket.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
        }
      } catch {
        socket.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    socket.on("close", async () => {
      const botSessionId = getBotSessionId(socket);
      if (botSessionId) {
        const closedSession = await sessionRepo.findOne({
          where: { id: botSessionId, status: SessionStatus.ACTIVE },
          relations: ["character"],
        });

        await sessionRepo.update(
          { id: botSessionId, status: SessionStatus.ACTIVE },
          { status: SessionStatus.COMPLETED, endedAt: new Date() },
        );
        broadcastToRoom(botSessionId, { type: "session-ended", sessionId: botSessionId });
        removeSession(botSessionId);

        if (closedSession) {
          const discordQueue = getDiscordNotificationQueue();
          if (discordQueue) {
            await discordQueue.add("notification", {
              userId: closedSession.character.userId,
              sessionId: botSessionId,
              notificationType: "sessionEnded",
              data: {
                characterName: closedSession.character.name,
                duration: closedSession.duration,
                totalKills: closedSession.totalKills,
                xpPerHour: closedSession.xpPerHour,
                totalLootValue: closedSession.totalLootValue,
                huntLocation: closedSession.huntLocation,
              },
            });
          }
        }
      }
      removeFromAllRooms(socket);
    });
  });
};

async function authenticateWithLicenseKey(
  token: string,
  licenseKeyRepo: Repository<LicenseKeyEntity>,
  socket: WebSocket,
): Promise<string | null> {
  const keyPrefix = token.slice(0, 11);
  const licenseKey = await licenseKeyRepo.findOne({
    where: { keyPrefix, status: "active" },
    relations: ["subscription"],
  });

  if (!licenseKey) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid API key" }));
    socket.close(4001, "Invalid API key");
    return null;
  }

  const isValid = await bcrypt.compare(token, licenseKey.keyHash);
  if (!isValid) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid API key" }));
    socket.close(4001, "Invalid API key");
    return null;
  }

  if (
    !licenseKey.subscription ||
    licenseKey.subscription.status !== "active" ||
    new Date() > licenseKey.subscription.currentPeriodEnd
  ) {
    socket.send(JSON.stringify({ type: "error", message: "Subscription inactive" }));
    socket.close(4002, "Subscription inactive");
    return null;
  }

  return licenseKey.userId;
}

async function authenticateWithJwt(
  request: { cookies: Record<string, string | undefined> },
  app: { jwt: { verify: (token: string) => { sub: string } } },
  socket: WebSocket,
): Promise<string | null> {
  try {
    const cookieToken = request.cookies[COOKIE_NAME];
    if (!cookieToken) {
      socket.send(JSON.stringify({ type: "error", message: "Missing authentication" }));
      socket.close(4001, "Missing authentication");
      return null;
    }

    const payload = app.jwt.verify(cookieToken);
    return payload.sub;
  } catch {
    socket.send(JSON.stringify({ type: "error", message: "Invalid token" }));
    socket.close(4001, "Invalid token");
    return null;
  }
}

async function validateSessionOwnership(
  sessionId: string,
  userId: string,
  sessionRepo: Repository<SessionEntity>,
): Promise<boolean> {
  const session = await sessionRepo.findOne({
    where: { id: sessionId },
    relations: ["character"],
  });
  return !!session && session.character.userId === userId;
}

async function handleJoinSession(
  socket: WebSocket,
  userId: string,
  sessionId: string,
  sessionRepo: Repository<SessionEntity>,
): Promise<void> {
  const isValid = await validateSessionOwnership(sessionId, userId, sessionRepo);
  if (!isValid) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid session" }));
    return;
  }

  joinRoom(socket, sessionId);
  socket.send(JSON.stringify({ type: "joined-session", sessionId }));
}

async function handlePosition(
  socket: WebSocket,
  userId: string,
  message: PositionMessage,
  sessionRepo: Repository<SessionEntity>,
): Promise<void> {
  const session = await sessionRepo.findOne({
    where: { id: message.sessionId },
    relations: ["character"],
  });

  if (!session || session.character.userId !== userId) {
    socket.send(JSON.stringify({ type: "error", message: "Invalid session" }));
    return;
  }

  if (session.status !== SessionStatus.ACTIVE) {
    socket.send(JSON.stringify({ type: "error", message: "Session not active" }));
    return;
  }

  const position = {
    x: message.x,
    y: message.y,
    z: message.z,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  updateRoomPosition(message.sessionId, position);

  broadcastToRoom(
    message.sessionId,
    { type: "position", sessionId: message.sessionId, ...position },
    socket,
  );

  addPosition(message.sessionId, message.x, message.y, message.z, position.timestamp);

  socket.send(JSON.stringify({ type: "position-ack", sessionId: message.sessionId }));
}

async function handleStatus(
  socket: WebSocket,
  userId: string,
  message: StatusMessage,
  sessionRepo: Repository<SessionEntity>,
): Promise<void> {
  const session = await sessionRepo.findOne({
    where: { id: message.sessionId },
    relations: ["character"],
  });

  if (!session || session.character.userId !== userId) {
    return;
  }

  if (session.status !== SessionStatus.ACTIVE) {
    return;
  }

  const statusData = {
    hpPercent: message.hpPercent,
    manaPercent: message.manaPercent,
    botState: message.botState,
    targetCreature: message.targetCreature ?? null,
    currentTask: message.currentTask ?? null,
    experience: message.experience ?? null,
    level: message.level ?? null,
    speed: message.speed ?? null,
    stamina: message.stamina ?? null,
    capacity: message.capacity ?? null,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  updateRoomStatus(message.sessionId, statusData);

  broadcastToRoom(
    message.sessionId,
    {
      type: "status",
      sessionId: message.sessionId,
      ...statusData,
    },
    socket,
  );

  const discordQueue = getDiscordNotificationQueue();
  if (!discordQueue) return;

  const characterName = session.character.name;
  const room = getRoom(message.sessionId);

  if (message.hpPercent < 20) {
    const debounceKey = `discord:lowHp:${message.sessionId}`;
    const isNew = await redis.set(debounceKey, "1", "EX", LOW_HP_DEBOUNCE_SECONDS, "NX");
    if (isNew === "OK") {
      await discordQueue.add("notification", {
        userId,
        sessionId: message.sessionId,
        notificationType: "lowHp",
        data: {
          characterName,
          hpPercent: message.hpPercent,
          positionX: room?.lastPosition?.x,
          positionY: room?.lastPosition?.y,
          positionZ: room?.lastPosition?.z,
        },
      });
    }
  }

  if (message.botState === "stuck") {
    const debounceKey = `discord:botStuck:${message.sessionId}`;
    const isNew = await redis.set(debounceKey, "1", "EX", BOT_STUCK_DEBOUNCE_SECONDS, "NX");
    if (isNew === "OK") {
      await discordQueue.add("notification", {
        userId,
        sessionId: message.sessionId,
        notificationType: "botStuck",
        data: {
          characterName,
          currentTask: message.currentTask,
          positionX: room?.lastPosition?.x,
          positionY: room?.lastPosition?.y,
          positionZ: room?.lastPosition?.z,
        },
      });
    }
  }
}
