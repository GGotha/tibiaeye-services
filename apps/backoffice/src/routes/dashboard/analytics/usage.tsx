import { MetricCard } from "@/components/cards/metric-card";
import { UsageChart } from "@/components/charts/usage-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformStats, useUsageData } from "@/hooks/use-platform-analytics";
import { formatDuration, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, Database, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/analytics/usage")({
  component: UsagePage,
});

function UsagePage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { data: stats } = usePlatformStats();
  const { data: usageData, isLoading } = useUsageData(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Platform Usage</h1>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sessions Today"
          value={stats ? formatNumber(stats.usage.sessionsToday) : "-"}
          icon={Activity}
          description="Hunting sessions"
        />
        <MetricCard
          title="API Requests Today"
          value={stats ? formatNumber(stats.usage.apiRequestsToday) : "-"}
          icon={Database}
          description="Total API calls"
        />
        <MetricCard
          title="Avg Session Duration"
          value={stats ? formatDuration(stats.usage.avgSessionDuration) : "-"}
          icon={Clock}
          description="Average per session"
        />
        <MetricCard
          title="Peak Concurrent Bots"
          value={stats ? formatNumber(stats.usage.peakConcurrentBots) : "-"}
          icon={Users}
          description="Today's peak"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <UsageChart data={usageData || []} title="Platform Activity" />
      )}
    </div>
  );
}
