import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "./use-realtime";

interface BotStatus {
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature: string | null;
  currentTask: string | null;
  isStuck: boolean;
}

const LOW_HP_THRESHOLD = 20;
const NOTIFICATION_COOLDOWN_MS = 30000;

function sendNotification(title: string, body: string): void {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
  });
}

export function useNotifications(
  sessionId: string | undefined,
  botStatus: BotStatus | null,
  lastEvent: RealtimeEvent | null,
  isConnected: boolean
): void {
  const lastLowHpRef = useRef(0);
  const lastStuckRef = useRef(0);
  const lastEventIdRef = useRef<string | null>(null);

  // Request permission on mount
  useEffect(() => {
    if (!sessionId) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [sessionId]);

  // Watch HP
  useEffect(() => {
    if (!botStatus || !isConnected) return;

    const now = Date.now();

    if (botStatus.hpPercent < LOW_HP_THRESHOLD && botStatus.hpPercent > 0) {
      if (now - lastLowHpRef.current > NOTIFICATION_COOLDOWN_MS) {
        sendNotification("Low HP Warning", `HP at ${botStatus.hpPercent}%! Check your character.`);
        lastLowHpRef.current = now;
      }
    }

    if (botStatus.isStuck) {
      if (now - lastStuckRef.current > NOTIFICATION_COOLDOWN_MS) {
        sendNotification("Bot Stuck", "The bot appears to be stuck. Check your character.");
        lastStuckRef.current = now;
      }
    }
  }, [botStatus, isConnected]);

  // Watch events (death, level_up)
  useEffect(() => {
    if (!lastEvent) return;

    const eventId = `${lastEvent.eventType}-${Date.now()}`;
    if (eventId === lastEventIdRef.current) return;
    lastEventIdRef.current = eventId;

    if (lastEvent.eventType === "death") {
      const killer = lastEvent.data?.killer as string | undefined;
      sendNotification(
        "Character Died!",
        killer ? `Killed by ${killer}` : "Your character has died!"
      );
    }

    if (lastEvent.eventType === "level_up") {
      const newLevel = lastEvent.data?.newLevel as number | undefined;
      sendNotification(
        "Level Up!",
        newLevel ? `Congratulations! You reached level ${newLevel}!` : "Your character leveled up!"
      );
    }
  }, [lastEvent]);
}
