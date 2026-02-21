import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Cog, Crosshair, Droplets, Heart } from "lucide-react";

interface BotStatusCardProps {
  hpPercent: number;
  manaPercent: number;
  botState: string;
  targetCreature: string | null;
  currentTask: string | null;
  isConnected: boolean;
}

const stateConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  running: {
    label: "Running",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  paused: {
    label: "Paused",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  reconnecting: {
    label: "Reconnecting",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  stopped: {
    label: "Stopped",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

export function BotStatusCard({
  hpPercent,
  manaPercent,
  botState,
  targetCreature,
  currentTask,
  isConnected,
}: BotStatusCardProps) {
  const state = stateConfig[botState] ?? stateConfig.stopped;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400">Bot Status</h3>
          <div className="flex items-center gap-2">
            <span
              className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-red-500")}
            />
            <Badge className={cn(state.bg, state.color, state.border)}>{state.label}</Badge>
          </div>
        </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
