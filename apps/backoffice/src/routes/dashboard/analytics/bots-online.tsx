import { RealtimeBots } from "@/components/charts/realtime-bots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveBotsCount, usePlatformStats } from "@/hooks/use-platform-analytics";
import { formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics/bots-online")({
  component: BotsOnlinePage,
});

function BotsOnlinePage() {
  const { data: botsData } = useActiveBotsCount();
  const { data: stats } = usePlatformStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Live Bots</h1>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-400">Live - Updates every 5s</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RealtimeBots />

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Sessions Today</CardTitle>
            <Activity className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats ? formatNumber(stats.usage.sessionsToday) : "-"}
            </div>
            <p className="text-xs text-slate-500">Total sessions started</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Peak Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {botsData ? formatNumber(botsData.peak) : "-"}
            </div>
            <p className="text-xs text-slate-500">Maximum concurrent bots</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">About Live Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-400">
          <p>
            This page shows real-time statistics about active bots on the platform. The data
            refreshes automatically every 5 seconds to give you an up-to-date view of platform
            activity.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-400" />
              <span>Bots Online: Currently running hunting sessions</span>
            </li>
            <li className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400" />
              <span>Sessions Today: Total sessions initiated in the last 24 hours</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <span>Peak Today: Highest number of concurrent bots in the last 24 hours</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
