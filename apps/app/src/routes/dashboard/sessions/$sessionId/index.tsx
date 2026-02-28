import { BotStatusCard } from "@/components/cards/bot-status-card";
import { NextLevelCard } from "@/components/cards/next-level-card";
import { XPChart } from "@/components/charts/xp-chart";
import { LiveMap } from "@/components/map/live-map";
import { KillsTable } from "@/components/tables/kills-table";
import { TimelineItem } from "@/components/timeline/timeline-item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import {
  useExperienceHourly,
  useGameEvents,
  useKillsByCreature,
  useKillsHeatmap,
  useLootSummary,
  usePositionHeatmap,
  useProfit,
  useTimeline,
} from "@/hooks/use-analytics";
import { useNotifications } from "@/hooks/use-notifications";
import { useSessionPositions } from "@/hooks/use-positions";
import { useRealtimeSession } from "@/hooks/use-realtime";
import { useSession } from "@/hooks/use-sessions";
import { itemSpriteUrl } from "@/lib/tibia-sprites";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import type { TimelineEvent } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, ArrowLeft, Clock, Coins, DollarSign, Skull, Sword, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/dashboard/sessions/$sessionId/")({
  component: SessionDetailPage,
});

function SessionDetailPage() {
  const { sessionId } = Route.useParams();
  const { data: session, isLoading } = useSession(sessionId);
  const { data: experienceData } = useExperienceHourly(sessionId);
  const { data: killsData } = useKillsByCreature(sessionId);
  const { data: lootData } = useLootSummary(sessionId);
  const [heatmapTimeRange, setHeatmapTimeRange] = useState<number | null>(null);

  const heatmapStartDate = useMemo(() => {
    if (heatmapTimeRange == null) return undefined;
    return new Date(Date.now() - heatmapTimeRange * 60 * 1000).toISOString();
  }, [heatmapTimeRange]);

  const { data: heatmapData } = useKillsHeatmap(sessionId, heatmapStartDate);
  const { data: timelineData } = useTimeline(sessionId, 10);
  const { data: gameEvents } = useGameEvents(sessionId);
  const { data: profitData } = useProfit({ sessionId });
  const { position, stats, botStatus, lastEvent, timelineEvents, isConnected } = useRealtimeSession(
    session?.status === "active" ? sessionId : ""
  );
  useNotifications(
    session?.status === "active" ? sessionId : undefined,
    botStatus,
    lastEvent,
    isConnected
  );

  const queryClient = useQueryClient();
  const prevStatsRef = useRef(stats);

  useEffect(() => {
    if (stats && stats !== prevStatsRef.current) {
      prevStatsRef.current = stats;
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["experience-hourly", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["kills-by-creature", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["loot-summary", sessionId] });
    }
  }, [stats, sessionId, queryClient]);

  const isActive = session?.status === "active";
  const isCompleted = session?.status === "completed" || session?.status === "crashed";

  const [liveDuration, setLiveDuration] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive || !session) {
      setLiveDuration(null);
      return;
    }
    const tick = () => {
      setLiveDuration(
        Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000))
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isActive, session]);

  const { data: pathData } = useSessionPositions(sessionId, isCompleted);
  const { data: visitHeatmapData } = usePositionHeatmap(sessionId, heatmapStartDate);

  // Merge real-time events with initial data, dedup by type+timestamp, limit to 10
  const mergedTimeline = useMemo(() => {
    const initial = timelineData?.events ?? [];
    const all = [...timelineEvents, ...initial];
    const seen = new Set<string>();
    const deduped: TimelineEvent[] = [];
    for (const event of all) {
      const key = `${event.type}:${event.timestamp}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(event);
    }
    deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return deduped.slice(0, 10);
  }, [timelineData, timelineEvents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Session not found</p>
        <Link to="/dashboard/sessions">
          <Button variant="outline" className="mt-4 border-slate-700">
            Back to Sessions
          </Button>
        </Link>
      </div>
    );
  }

  const duration =
    liveDuration ??
    Math.max(
      0,
      session.endedAt
        ? Math.round(
            (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
          )
        : Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/sessions">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{session.characterName}</h1>
              <Badge
                className={cn(
                  session.status === "active" &&
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  session.status === "completed" &&
                    "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  session.status === "crashed" && "bg-red-500/10 text-red-400 border-red-500/20"
                )}
              >
                {session.status}
              </Badge>
            </div>
            <p className="text-slate-400">
              {session.huntLocation || "Unknown location"} - {formatDateTime(session.startedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-slate-400" />
              <div>
                <p className="text-sm text-slate-400">Duration</p>
                <p className="text-2xl font-bold text-white">{formatDuration(duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Sword className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-slate-400">Total Kills</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalKills ?? session.totalKills)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-sm text-slate-400">XP/Hour</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.xpPerHour ?? session.xpPerHour)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Loot Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalLootValue ?? session.totalLootValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <NextLevelCard
          experience={botStatus?.experience ?? null}
          level={botStatus?.level ?? null}
          xpPerHour={stats?.xpPerHour ?? session.xpPerHour}
        />
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-sm text-slate-400">Kills/Hour</p>
                <p className="text-2xl font-bold text-white">
                  {duration > 0 ? formatNumber(Math.round((stats?.totalKills ?? session.totalKills) / (duration / 3600))) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-sm text-slate-400">Loot/Hour</p>
                <p className="text-2xl font-bold text-white">
                  {duration > 0 ? formatNumber(Math.round((stats?.totalLootValue ?? session.totalLootValue) / (duration / 3600))) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Skull className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-slate-400">Deaths</p>
                <p className="text-2xl font-bold text-white">
                  {gameEvents ? gameEvents.filter((e) => e.type === "death").length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Net Profit</p>
                <p className={cn(
                  "text-2xl font-bold",
                  profitData && profitData.netProfit >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {profitData ? formatNumber(profitData.netProfit) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-sm text-slate-400">Profit/Hour</p>
                <p className={cn(
                  "text-2xl font-bold",
                  profitData && profitData.profitPerHour >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {profitData ? formatNumber(Math.round(profitData.profitPerHour)) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {session.status === "active" && botStatus?.isStuck && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-medium text-amber-300">Character is stuck</p>
            <p className="text-sm text-amber-400/70">
              The bot detected that the character is not moving. Recovery actions are being
              attempted.
            </p>
          </div>
        </div>
      )}

      {session.status === "active" && botStatus && (
        <BotStatusCard
          hpPercent={botStatus.hpPercent}
          manaPercent={botStatus.manaPercent}
          targetCreature={botStatus.targetCreature}
          currentTask={botStatus.currentTask}
          speed={botStatus.speed}
          stamina={botStatus.stamina}
          capacity={botStatus.capacity}
        />
      )}

      {session.status === "active" && (
        <LiveMap
          position={position}
          isConnected={isConnected}
          heatmapData={heatmapData}
          visitHeatmapData={visitHeatmapData}
          heatmapTimeRange={heatmapTimeRange}
          onHeatmapTimeRangeChange={setHeatmapTimeRange}
        />
      )}

      {isCompleted && (
        <LiveMap
          position={null}
          isConnected={false}
          heatmapData={heatmapData}
          pathData={pathData}
          visitHeatmapData={visitHeatmapData}
          heatmapTimeRange={heatmapTimeRange}
          onHeatmapTimeRangeChange={setHeatmapTimeRange}
        />
      )}

      {experienceData && (
        <XPChart
          data={experienceData.dataPoints}
          averageXpPerHour={experienceData.xpPerHourAverage}
        />
      )}

      <Tabs defaultValue="kills" className="w-full">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="kills">Kills</TabsTrigger>
          <TabsTrigger value="loot">Loot</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="kills" className="mt-4">
          {killsData && killsData.length > 0 ? (
            <KillsTable kills={killsData} />
          ) : (
            <div className="text-center py-8 text-slate-400">
              No kills recorded in this session.
            </div>
          )}
        </TabsContent>

        <TabsContent value="loot" className="mt-4">
          {lootData && lootData.items.length > 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Item</TableHead>
                    <TableHead className="text-slate-400 text-right">Quantity</TableHead>
                    <TableHead className="text-slate-400 text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lootData.items.map((item) => (
                    <TableRow
                      key={item.itemName}
                      className="border-slate-800 hover:bg-slate-800/50"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <TibiaSprite
                            src={itemSpriteUrl(item.itemName)}
                            alt={item.itemName}
                            size="sm"
                          />
                          {item.itemName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right text-yellow-400">
                        {formatNumber(item.totalValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Loot Value</span>
                  <span className="text-xl font-bold text-yellow-400">
                    {formatNumber(lootData.totalValue)} gold
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">No loot recorded in this session.</div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          {mergedTimeline.length > 0 ? (
            <div className="space-y-2">
              {mergedTimeline.map((event, index) => (
                <TimelineItem key={`${event.type}-${event.timestamp}-${index}`} event={event} />
              ))}
              <div className="flex justify-center pt-2">
                <Link to="/dashboard/sessions/$sessionId/timeline" params={{ sessionId }}>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white"
                  >
                    View All
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No events recorded in this session yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
