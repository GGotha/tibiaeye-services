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
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";
const MAX_RECONNECT_DELAY_MS = 30000;
const INITIAL_RECONNECT_DELAY_MS = 1000;

function getWsUrl(sessionId: string): string {
  const url = new URL(API_URL);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/ws?session=${sessionId}`;
}

export function useRealtimeSession(sessionId: string) {
  const [position, setPosition] = useState<Position | null>(null);
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
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
            });
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

  return { position, stats, botStatus, isConnected };
}

export function useRealtimePosition(sessionId: string) {
  const { position, isConnected } = useRealtimeSession(sessionId);
  return { position, isConnected };
}
