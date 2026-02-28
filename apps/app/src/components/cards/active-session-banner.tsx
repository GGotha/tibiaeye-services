import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRealtimeSession } from "@/hooks/use-realtime";
import { formatDuration, formatNumber } from "@/lib/utils";
import type { Session } from "@/types";
import { Link } from "@tanstack/react-router";
import { Activity, Clock, Coins, Droplets, Eye, Heart, Sword } from "lucide-react";

interface ActiveSessionBannerProps {
  session: Session;
}

export function ActiveSessionBanner({ session }: ActiveSessionBannerProps) {
  const { position, stats, botStatus, isConnected } = useRealtimeSession(session.id);
  const duration = Math.max(
    0,
    Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
  );

  const totalKills = stats?.totalKills ?? session.totalKills;
  const totalExperience = stats?.totalExperience ?? Number(session.totalExperience);
  const totalLootValue = stats?.totalLootValue ?? session.totalLootValue;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-emerald-950/60 via-cyan-950/30 to-slate-900/50 border-emerald-500/30 animate-gradient-shift">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{session.characterName}</h3>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                  ONLINE
                </Badge>
              </div>
              <p className="text-sm text-slate-400">{session.huntLocation || "Unknown location"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-800/50">
              <Clock className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatDuration(duration)}</p>
              <p className="text-xs text-slate-500">Duration</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-800/50">
              <Sword className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(totalKills)}</p>
              <p className="text-xs text-slate-500">Kills</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-800/50">
              <Activity className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(totalExperience)}</p>
              <p className="text-xs text-slate-500">XP Gained</p>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-slate-800/50">
              <Coins className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-white">{formatNumber(totalLootValue)}</p>
              <p className="text-xs text-slate-500">Loot Value</p>
            </div>
          </div>

          {botStatus && (
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-slate-500">HP</span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                    style={{ width: `${botStatus.hpPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-white mt-0.5">{botStatus.hpPercent}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Droplets className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-slate-500">Mana</span>
                </div>
                <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${botStatus.manaPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-white mt-0.5">{botStatus.manaPercent}%</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="border-slate-700 hover:border-emerald-500/50">
              <Link to="/dashboard/sessions/$sessionId" params={{ sessionId: session.id }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-emerald-500 hover:bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Link to="/dashboard/live-map">Live Map</Link>
            </Button>
          </div>
        </div>

        {position && (
          <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-2 text-sm text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-red-500"}`}
            />
            <span>
              Position: {position.x}, {position.y}, {position.z}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
