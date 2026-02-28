import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { creatureSpriteUrl, itemSpriteUrl } from "@/lib/tibia-sprites";
import { cn, formatNumber, getRelativeTime } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import {
  AlertTriangle,
  Coins,
  Crosshair,
  Heart,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Skull,
  Sword,
  TrendingUp,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

const EVENT_CONFIG: Record<string, { icon: typeof Sword; colorClass: string }> = {
  kill: { icon: Sword, colorClass: "bg-red-500/10 text-red-400" },
  loot: { icon: Coins, colorClass: "bg-yellow-500/10 text-yellow-400" },
  level_up: { icon: TrendingUp, colorClass: "bg-emerald-500/10 text-emerald-400" },
  death: { icon: Skull, colorClass: "bg-red-500/10 text-red-400" },
  refill: { icon: RefreshCw, colorClass: "bg-blue-500/10 text-blue-400" },
  attack_start: { icon: Crosshair, colorClass: "bg-orange-500/10 text-orange-400" },
  waypoint_reached: { icon: MapPin, colorClass: "bg-purple-500/10 text-purple-400" },
  warning: { icon: AlertTriangle, colorClass: "bg-amber-500/10 text-amber-400" },
  heal: { icon: Heart, colorClass: "bg-pink-500/10 text-pink-400" },
  pause: { icon: Pause, colorClass: "bg-slate-500/10 text-slate-400" },
  resume: { icon: Play, colorClass: "bg-green-500/10 text-green-400" },
  disconnect: { icon: WifiOff, colorClass: "bg-red-500/10 text-red-400" },
  reconnect_success: { icon: Wifi, colorClass: "bg-green-500/10 text-green-400" },
  reconnect_retry: { icon: RefreshCw, colorClass: "bg-amber-500/10 text-amber-400" },
  reconnect_failure: { icon: XCircle, colorClass: "bg-red-500/10 text-red-400" },
};

function formatEventDescription(event: TimelineEvent): React.ReactNode {
  const d = event.data ?? {};

  switch (event.type) {
    case "kill":
      return (
        <span className="inline-flex items-center gap-1.5">
          <TibiaSprite
            src={creatureSpriteUrl(String(d.creatureName ?? "Unknown"))}
            alt={String(d.creatureName ?? "Unknown")}
            size="sm"
          />
          Killed <span className="font-medium">{String(d.creatureName ?? "Unknown")}</span>
          {d.experienceGained != null && (
            <span className="text-emerald-400">
              {" "}
              +{formatNumber(Number(d.experienceGained))} XP
            </span>
          )}
        </span>
      );
    case "loot":
      return (
        <span className="inline-flex items-center gap-1.5">
          <TibiaSprite
            src={itemSpriteUrl(String(d.itemName ?? "Unknown"))}
            alt={String(d.itemName ?? "Unknown")}
            size="sm"
          />
          Looted{" "}
          <span className="font-medium">
            {String(d.quantity ?? 1)}x {String(d.itemName ?? "Unknown")}
          </span>
          {d.estimatedValue != null && (
            <span className="text-yellow-400">
              {" "}
              ({formatNumber(Number(d.estimatedValue))} gold)
            </span>
          )}
        </span>
      );
    case "level_up":
      return (
        <>
          Level up!{" "}
          <span className="font-medium text-emerald-400">Level {String(d.newLevel ?? "?")}</span>
        </>
      );
    case "death":
      return (
        <>
          Died
          {d.killer ? (
            <>
              {" "}
              killed by <span className="font-medium">{String(d.killer)}</span>
            </>
          ) : null}
        </>
      );
    case "refill":
      return <>Refilled supplies</>;
    case "attack_start":
      return (
        <>
          Attacking <span className="font-medium">{String(d.creatureName ?? "Unknown")}</span>
        </>
      );
    case "waypoint_reached":
      return (
        <>
          Reached waypoint <span className="font-medium">#{String(d.waypointIndex ?? "?")}</span>
        </>
      );
    case "warning":
      return (
        <span className={cn(d.level === "error" ? "text-red-400" : "text-amber-400")}>
          {String(d.message ?? "Unknown warning")}
        </span>
      );
    case "heal":
      return (
        <>
          Used <span className="font-medium">{String(d.healType ?? "heal")}</span>
          {d.potionType ? ` (${String(d.potionType)})` : ""}
          {d.hpPercent != null && (
            <span className="text-red-400"> HP: {String(d.hpPercent)}%</span>
          )}
          {d.manaPercent != null && (
            <span className="text-blue-400"> Mana: {String(d.manaPercent)}%</span>
          )}
        </>
      );
    case "pause":
      return <>Bot paused</>;
    case "resume":
      return <>Bot resumed</>;
    case "disconnect":
      return (
        <>
          Disconnected{d.reason ? `: ${String(d.reason)}` : ""}
        </>
      );
    case "reconnect_retry":
      return (
        <>
          Reconnect attempt <span className="font-medium">#{String(d.retryCount ?? "?")}</span>
          {d.reason ? ` — ${String(d.reason)}` : ""}
        </>
      );
    case "reconnect_success":
      return (
        <>
          Reconnected after{" "}
          <span className="font-medium text-green-400">
            {String(d.retryCount ?? "?")} {Number(d.retryCount) === 1 ? "attempt" : "attempts"}
          </span>
          {d.durationSeconds != null && ` (${String(d.durationSeconds)}s)`}
        </>
      );
    case "reconnect_failure":
      return (
        <>
          Reconnection failed after{" "}
          <span className="font-medium text-red-400">
            {String(d.retryCount ?? "?")} attempts
          </span>
          {d.reason ? ` — ${String(d.reason)}` : ""}
        </>
      );
    default:
      return <>{event.type}</>;
  }
}

interface TimelineItemProps {
  event: TimelineEvent;
}

export function TimelineItem({ event }: TimelineItemProps) {
  const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.kill;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
      <div className={cn("mt-0.5 rounded-full p-1.5", config.colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{formatEventDescription(event)}</p>
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">
        {getRelativeTime(event.timestamp)}
      </span>
    </div>
  );
}
