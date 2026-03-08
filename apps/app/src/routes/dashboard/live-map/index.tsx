import { LiveMap } from "@/components/map/live-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveSessions } from "@/hooks/use-sessions";
import { formatDuration, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, Coins, Sword } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/live-map/")({
  component: LiveMapPage,
});

const CURRENT_SESSION_VALUE = "__current__";

function LiveMapPage() {
  const { data: activeSessions = [] } = useActiveSessions();
  const [selectedSessionId, setSelectedSessionId] = useState<string>(CURRENT_SESSION_VALUE);
  const [floor, setFloor] = useState<number>(7);

  const currentSession =
    selectedSessionId === CURRENT_SESSION_VALUE
      ? (activeSessions[0] ?? null)
      : (activeSessions.find((s) => s.id === selectedSessionId) ?? null);

  const duration = currentSession
    ? Math.max(0, Math.round((Date.now() - new Date(currentSession.startedAt).getTime()) / 1000))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Live Map</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-[250px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select active session" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {activeSessions.map((session, index) => (
                <SelectItem
                  key={session.id}
                  value={index === 0 ? CURRENT_SESSION_VALUE : session.id}
                >
                  {session.characterName}
                  {index === 0 ? " (current)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={floor.toString()} onValueChange={(v) => setFloor(Number(v))}>
            <SelectTrigger className="w-[100px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Array.from({ length: 16 }, (_, i) => (
                <SelectItem key={`floor-${i}`} value={i.toString()}>
                  Floor {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <LiveMap position={null} isConnected={false} />
          </div>

          <div className="space-y-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{currentSession.characterName}</CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse">
                    ONLINE
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">
                  {currentSession.huntLocation || "Unknown location"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="font-semibold text-white">{formatDuration(duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-slate-400">XP/Hour</p>
                    <p className="font-semibold text-white">
                      {formatNumber(currentSession.xpPerHour)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sword className="h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-xs text-slate-400">Kills</p>
                    <p className="font-semibold text-white">
                      {formatNumber(currentSession.totalKills)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-xs text-slate-400">Loot Value</p>
                    <p className="font-semibold text-white">
                      {formatNumber(currentSession.totalLootValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 mb-2">No active session</p>
            <p className="text-sm text-slate-500">
              Start a hunting session to see your live position on the map
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
