import { Card, CardContent } from "@/components/ui/card";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { creatureSpriteUrl } from "@/lib/tibia-sprites";
import { cn } from "@/lib/utils";
import { Clock, Cog, Crosshair, Droplets, Gauge, Heart, Weight } from "lucide-react";

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
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-slate-400">HP</span>
            </div>
            <span className="text-xs font-medium text-white">{hpPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                hpPercent > 50 ? "bg-red-500" : hpPercent > 25 ? "bg-orange-500" : "bg-red-600"
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
          <div className="h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
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
              <Cog className="h-3.5 w-3.5 text-slate-400" />
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
