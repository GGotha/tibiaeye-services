import type { TimelineEvent } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface RealtimeStats {
  totalKills: number;
  totalExperience: number;
  totalLootValue: number;
  xpPerHour: number;
}

interface BotStatus {
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature: string | null;
  currentTask: string | null;
  experience: number | null;
  level: number | null;
  speed: number | null;
  stamina: number | null;
  capacity: number | null;
  isStuck: boolean;
}

function resolveApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return `http://${window.location.hostname}:3333`;

  try {
    const parsed = new URL(envUrl);
    if (parsed.hostname === "localhost" && window.location.hostname !== "localhost") {
      return `http://${window.location.hostname}:${parsed.port || "3333"}`;
    }
    return envUrl;
  } catch {
    return envUrl;
  }
}

const API_URL = resolveApiUrl();
const MAX_RECONNECT_DELAY_MS = 30000;
const INITIAL_RECONNECT_DELAY_MS = 1000;

function getWsUrl(sessionId: string): string {
  const url = new URL(API_URL);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws?session=${sessionId}`;
}

export interface RealtimeEvent {
  eventType: string;
  data?: Record<string, unknown>;
}

export function useRealtimeSession(sessionId: string) {
  const [position, setPosition] = useState<Position | null>(null);
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!sessionId) return;

    const ws = new WebSocket(getWsUrl(sessionId));
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptRef.current = 0;
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttemptRef.current,
        MAX_RECONNECT_DELAY_MS
      );
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "position":
            setPosition({ x: data.x, y: data.y, z: data.z });
            break;
          case "stats":
            setStats({
              totalKills: data.totalKills,
              totalExperience: data.totalExperience,
              totalLootValue: data.totalLootValue,
              xpPerHour: data.xpPerHour,
            });
            break;
          case "status":
            setBotStatus({
              hpPercent: data.hpPercent,
              manaPercent: data.manaPercent,
              botState: data.botState,
              targetCreature: data.targetCreature,
              currentTask: data.currentTask,
              experience: data.experience ?? null,
              level: data.level ?? null,
              speed: data.speed ?? null,
              stamina: data.stamina ?? null,
              capacity: data.capacity ?? null,
              isStuck: data.isStuck ?? false,
            });
            break;
          case "event":
            setLastEvent({
              eventType: data.eventType,
              data: data,
            });
            break;
          case "timeline-event":
            setTimelineEvents((prev) => {
              const event: TimelineEvent = {
                type: data.eventType,
                timestamp: data.timestamp,
                data: data,
              };
              const next = [event, ...prev];
              return next.length > 100 ? next.slice(0, 100) : next;
            });
            break;
          case "session-ended":
            setBotStatus(null);
            break;
        }
      } catch {
        // ignore invalid messages
      }
    };
  }, [sessionId]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { position, stats, botStatus, lastEvent, timelineEvents, isConnected };
}

export function useRealtimePosition(sessionId: string) {
  const { position, isConnected } = useRealtimeSession(sessionId);
  return { position, isConnected };
}
