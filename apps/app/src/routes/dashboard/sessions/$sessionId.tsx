import { BotStatusCard } from "@/components/cards/bot-status-card";
import { XPChart } from "@/components/charts/xp-chart";
import { LiveMap } from "@/components/map/live-map";
import { KillsTable } from "@/components/tables/kills-table";
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
import { useExperienceHourly, useKillsByCreature, useLootSummary } from "@/hooks/use-analytics";
import { useRealtimeSession } from "@/hooks/use-realtime";
import { useSession } from "@/hooks/use-sessions";
import { cn, formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import type { ExperienceSnapshot, Kill, Loot } from "@/types";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowLeft, Clock, Coins, Sword, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/sessions/$sessionId")({
  component: SessionDetailPage,
});

type TimelineEvent =
  | { type: "kill"; timestamp: string; creatureName: string; experienceGained: number | null }
  | {
      type: "loot";
      timestamp: string;
      itemName: string;
      quantity: number;
      estimatedValue: number | null;
    }
  | { type: "level_up"; timestamp: string; level: number; experience: number };

function buildTimeline(
  kills: Kill[],
  loot: Loot[],
  snapshots: ExperienceSnapshot[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const kill of kills) {
    events.push({
      type: "kill",
      timestamp: kill.killedAt,
      creatureName: kill.creatureName,
      experienceGained: kill.experienceGained,
    });
  }

  for (const item of loot) {
    events.push({
      type: "loot",
      timestamp: item.lootedAt,
      itemName: item.itemName,
      quantity: item.quantity,
      estimatedValue: item.estimatedValue,
    });
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].level > sorted[i - 1].level) {
      events.push({
        type: "level_up",
        timestamp: sorted[i].recordedAt,
        level: sorted[i].level,
        experience: sorted[i].experience,
      });
    }
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDateTime(timestamp);
}

function SessionDetailPage() {
  const { sessionId } = Route.useParams();
  const { data: session, isLoading } = useSession(sessionId);
  const { data: experienceData } = useExperienceHourly(sessionId);
  const { data: killsData } = useKillsByCreature(sessionId);
  const { data: lootData } = useLootSummary(sessionId);
  const { position, botStatus, isConnected } = useRealtimeSession(
    session?.status === "active" ? sessionId : ""
  );

  const timeline = useMemo(() => {
    if (!session) return [];
    return buildTimeline(
      session.kills ?? [],
      session.loot ?? [],
      session.experienceSnapshots ?? []
    );
  }, [session]);

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

  const duration = session.endedAt
    ? Math.round(
        (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
      )
    : Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-white">{formatNumber(session.totalKills)}</p>
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
                <p className="text-2xl font-bold text-white">{formatNumber(session.xpPerHour)}</p>
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
                  {formatNumber(session.totalLootValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {session.status === "active" && botStatus && (
        <BotStatusCard
          hpPercent={botStatus.hpPercent}
          manaPercent={botStatus.manaPercent}
          botState={botStatus.botState}
          targetCreature={botStatus.targetCreature}
          currentTask={botStatus.currentTask}
          isConnected={isConnected}
        />
      )}

      {session.status === "active" && (
        <LiveMap position={position} isConnected={isConnected} />
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
                      <TableCell className="font-medium text-white">{item.itemName}</TableCell>
                      <TableCell className="text-right text-slate-300">
                        {formatNumber(item.totalQuantity)}
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
          {timeline.length > 0 ? (
            <div className="space-y-2">
              {timeline.map((event, index) => (
                <div
                  key={`${event.type}-${event.timestamp}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800"
                >
                  <div
                    className={cn(
                      "mt-0.5 rounded-full p-1.5",
                      event.type === "kill" && "bg-red-500/10 text-red-400",
                      event.type === "loot" && "bg-yellow-500/10 text-yellow-400",
                      event.type === "level_up" && "bg-emerald-500/10 text-emerald-400"
                    )}
                  >
                    {event.type === "kill" && <Sword className="h-4 w-4" />}
                    {event.type === "loot" && <Coins className="h-4 w-4" />}
                    {event.type === "level_up" && <TrendingUp className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      {event.type === "kill" && (
                        <>
                          Killed <span className="font-medium">{event.creatureName}</span>
                          {event.experienceGained != null && (
                            <span className="text-emerald-400">
                              {" "}
                              +{formatNumber(event.experienceGained)} XP
                            </span>
                          )}
                        </>
                      )}
                      {event.type === "loot" && (
                        <>
                          Looted{" "}
                          <span className="font-medium">
                            {event.quantity}x {event.itemName}
                          </span>
                          {event.estimatedValue != null && (
                            <span className="text-yellow-400">
                              {" "}
                              ({formatNumber(event.estimatedValue)} gold)
                            </span>
                          )}
                        </>
                      )}
                      {event.type === "level_up" && (
                        <>
                          Level up!{" "}
                          <span className="font-medium text-emerald-400">Level {event.level}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              ))}
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
