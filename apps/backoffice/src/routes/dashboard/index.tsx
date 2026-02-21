import { LicenseStatsCard } from "@/components/cards/license-stats-card";
import { MetricCard } from "@/components/cards/metric-card";
import { RevenueCard } from "@/components/cards/revenue-card";
import { RealtimeBots } from "@/components/charts/realtime-bots";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { useLicenseStats } from "@/hooks/use-licenses";
import { usePlatformStats, useRevenueData } from "@/hooks/use-platform-analytics";
import { formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { data: stats } = usePlatformStats();
  const { data: revenueData } = useRevenueData("30d");
  const { data: licenseStats } = useLicenseStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={stats?.users?.total != null ? formatNumber(stats.users.total) : "-"}
          icon={Users}
          trend={stats?.users?.growthRate}
          trendLabel="vs last month"
        />
        <MetricCard
          title="Active Today"
          value={stats?.users?.activeToday != null ? formatNumber(stats.users.activeToday) : "-"}
          icon={Activity}
          description="Users active in last 24h"
        />
        <MetricCard
          title="New This Week"
          value={stats?.users?.newThisWeek != null ? formatNumber(stats.users.newThisWeek) : "-"}
          icon={Users}
          description="Sign ups this week"
        />
        <MetricCard
          title="Sessions Today"
          value={stats?.usage?.sessionsToday != null ? formatNumber(stats.usage.sessionsToday) : "-"}
          icon={Activity}
          description="Hunting sessions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stats?.subscriptions && (
            <RevenueCard
              mrr={stats.subscriptions.mrr}
              mrrGrowth={stats.subscriptions.mrrGrowth}
              activeSubscriptions={stats.subscriptions.total}
              churnRate={stats.subscriptions.churnRate}
            />
          )}
        </div>
        <div>
          <RealtimeBots />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData || []} />
        </div>
        <div>{licenseStats && <LicenseStatsCard stats={licenseStats} />}</div>
      </div>
    </div>
  );
}
