import type { WebSocket } from "@fastify/websocket";

interface SessionRoom {
  subscribers: Set<WebSocket>;
  lastPosition?: { x: number; y: number; z: number; timestamp: string };
  lastStatus?: {
    hpPercent: number;
    manaPercent: number;
    botState: string;
    targetCreature: string | null;
    currentTask: string | null;
    timestamp: string;
  };
}

const rooms = new Map<string, SessionRoom>();

export function joinRoom(ws: WebSocket, sessionId: string): void {
  let room = rooms.get(sessionId);
  if (!room) {
    room = { subscribers: new Set() };
    rooms.set(sessionId, room);
  }
  room.subscribers.add(ws);

  if (room.lastPosition) {
    ws.send(
      JSON.stringify({
        type: "position",
        sessionId,
        ...room.lastPosition,
      }),
    );
  }

  if (room.lastStatus) {
    ws.send(
      JSON.stringify({
        type: "status",
        sessionId,
        ...room.lastStatus,
      }),
    );
  }
}

export function leaveRoom(ws: WebSocket, sessionId: string): void {
  const room = rooms.get(sessionId);
  if (!room) return;

  room.subscribers.delete(ws);
  if (room.subscribers.size === 0) {
    rooms.delete(sessionId);
  }
}

export function removeFromAllRooms(ws: WebSocket): void {
  for (const [roomId, room] of rooms.entries()) {
    room.subscribers.delete(ws);
    if (room.subscribers.size === 0) {
      rooms.delete(roomId);
    }
  }
}

export function updateRoomPosition(
  sessionId: string,
  position: { x: number; y: number; z: number; timestamp: string },
): void {
  let room = rooms.get(sessionId);
  if (!room) {
    room = { subscribers: new Set() };
    rooms.set(sessionId, room);
  }
  room.lastPosition = position;
}

export function updateRoomStatus(
  sessionId: string,
  status: {
    hpPercent: number;
    manaPercent: number;
    botState: string;
    targetCreature: string | null;
    currentTask: string | null;
    timestamp: string;
  },
): void {
  let room = rooms.get(sessionId);
  if (!room) {
    room = { subscribers: new Set() };
    rooms.set(sessionId, room);
  }
  room.lastStatus = status;
}

export function broadcastToRoom(
  sessionId: string,
  data: Record<string, unknown>,
  excludeWs?: WebSocket,
): void {
  const room = rooms.get(sessionId);
  if (!room) return;

  const message = JSON.stringify(data);

  for (const subscriber of room.subscribers) {
    if (subscriber !== excludeWs && subscriber.readyState === 1) {
      subscriber.send(message);
    }
  }
}

export function getRoom(sessionId: string): SessionRoom | undefined {
  return rooms.get(sessionId);
}
