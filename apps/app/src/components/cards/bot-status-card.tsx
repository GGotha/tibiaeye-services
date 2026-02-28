import { Card, CardContent } from "@/components/ui/card";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { creatureSpriteUrl } from "@/lib/tibia-sprites";
import { cn } from "@/lib/utils";
import { Clock, Cog, Crosshair, Droplets, Gauge, Heart, Monitor, Weight } from "lucide-react";

function formatStamina(minutes: number | null): string {
  if (minutes == null) return "--";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}m`;
}

interface BotStatusCardProps {
  hpPercent: number;
  manaPercent: number;
  targetCreature: string | null;
  currentTask: string | null;
  speed?: number | null;
  stamina?: number | null;
  capacity?: number | null;
}

export function BotStatusCard({
  hpPercent,
  manaPercent,
  targetCreature,
  currentTask,
  speed,
  stamina,
  capacity,
}: BotStatusCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Monitor className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Bot Status</h3>
          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-slate-400">HP</span>
            </div>
            <span className="text-xs font-medium text-white">{hpPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 progress-shimmer",
                hpPercent > 50
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : hpPercent > 25
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                    : "bg-gradient-to-r from-red-600 to-red-500 animate-bar-pulse",
              )}
              style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Mana</span>
            </div>
            <span className="text-xs font-medium text-white">{manaPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 progress-shimmer"
              style={{ width: `${Math.min(100, Math.max(0, manaPercent))}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          {targetCreature && (
            <div className="flex items-center gap-2 text-sm">
              <TibiaSprite src={creatureSpriteUrl(targetCreature)} alt={targetCreature} size="sm" />
              <Crosshair className="h-3.5 w-3.5 text-red-400" />
              <span className="text-slate-400">Target:</span>
              <span className="text-white font-medium">{targetCreature}</span>
            </div>
          )}
          {currentTask && (
            <div className="flex items-center gap-2 text-sm">
              <Cog className="h-3.5 w-3.5 text-slate-400 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-slate-400">Task:</span>
              <span className="text-white">{currentTask}</span>
            </div>
          )}
          {(speed != null || stamina != null || capacity != null) && (
            <div className="flex items-center gap-4 pt-1">
              {speed != null && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-slate-400">Speed:</span>
                  <span className="text-white">{speed}</span>
                </div>
              )}
              {stamina != null && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-slate-400">Stamina:</span>
                  <span className="text-white">{formatStamina(stamina)}</span>
                </div>
              )}
              {capacity != null && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Weight className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-slate-400">Cap:</span>
                  <span className="text-white">{capacity} oz</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
