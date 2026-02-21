import { MetricCard } from "@/components/cards/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformStats } from "@/hooks/use-platform-analytics";
import { formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Clock, Database, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/analytics/performance")({
  component: PerformancePage,
});

function PerformancePage() {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Performance Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="API Requests Today"
          value={stats ? formatNumber(stats.usage.apiRequestsToday) : "-"}
          icon={Database}
          description="Total API calls"
        />
        <MetricCard
          title="Active Users"
          value={stats ? formatNumber(stats.users.activeToday) : "-"}
          icon={Activity}
          description="Users active today"
        />
        <MetricCard
          title="Sessions Today"
          value={stats ? formatNumber(stats.usage.sessionsToday) : "-"}
          icon={Zap}
          description="Hunting sessions"
        />
        <MetricCard
          title="Peak Concurrent"
          value={stats ? formatNumber(stats.usage.peakConcurrentBots) : "-"}
          icon={Clock}
          description="Maximum today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">API Server</span>
              </div>
              <span className="text-emerald-400">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Database</span>
              </div>
              <span className="text-emerald-400">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">WebSocket Server</span>
              </div>
              <span className="text-emerald-400">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Payment Gateway</span>
              </div>
              <span className="text-emerald-400">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p>No recent alerts</p>
              <p className="text-sm text-slate-500">All systems operating normally</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
