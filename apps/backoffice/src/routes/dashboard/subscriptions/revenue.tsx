import { MetricCard } from "@/components/cards/metric-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatformStats, useRevenueData } from "@/hooks/use-platform-analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/subscriptions/revenue")({
  component: RevenuePage,
});

function RevenuePage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { data: stats } = usePlatformStats();
  const { data: revenueData, isLoading } = useRevenueData(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
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
          title="MRR"
          value={stats ? formatCurrency(stats.subscriptions.mrr) : "-"}
          icon={DollarSign}
          trend={stats?.subscriptions.mrrGrowth}
          trendLabel="vs last month"
        />
        <MetricCard
          title="Active Subscriptions"
          value={stats ? formatNumber(stats.subscriptions.total) : "-"}
          icon={Users}
          description="Paying customers"
        />
        <MetricCard
          title="Churn Rate"
          value={stats ? `${stats.subscriptions.churnRate.toFixed(1)}%` : "-"}
          icon={TrendingDown}
          description="Monthly churn"
        />
        <MetricCard
          title="Active Trials"
          value={stats ? formatNumber(stats.subscriptions.activeTrials) : "-"}
          icon={TrendingUp}
          description="Users in trial"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <RevenueChart data={revenueData || []} title="MRR Over Time" />
      )}
    </div>
  );
}
