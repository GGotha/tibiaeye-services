import { MetricCard } from "@/components/cards/metric-card";
import { UsageChart } from "@/components/charts/usage-chart";
import { SectionLabel } from "@/components/ui/section-label";
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
    <div className="space-y-5">
      <div
        className="flex items-center justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Analytics</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Uso da Plataforma</h1>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="7d">Ultimos 7 dias</SelectItem>
            <SelectItem value="30d">Ultimos 30 dias</SelectItem>
            <SelectItem value="90d">Ultimos 90 dias</SelectItem>
            <SelectItem value="1y">Ultimo ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Metricas de Uso</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="Sessoes Hoje"
            value={stats?.usage ? formatNumber(stats.usage.sessionsToday) : "-"}
            icon={Activity}
            description="Sessoes de hunt"
            borderColor="border-t-red-500/50"
          />
          <MetricCard
            title="Requisicoes API"
            value={stats?.usage ? formatNumber(stats.usage.apiRequestsToday) : "-"}
            icon={Database}
            description="Total hoje"
            borderColor="border-t-orange-500/50"
          />
          <MetricCard
            title="Duracao Media"
            value={stats?.usage ? formatDuration(stats.usage.avgSessionDuration) : "-"}
            icon={Clock}
            description="Por sessao"
            borderColor="border-t-blue-500/50"
          />
          <MetricCard
            title="Pico Concorrente"
            value={stats?.usage ? formatNumber(stats.usage.peakConcurrentBots) : "-"}
            icon={Users}
            description="Bots simultaneos"
            borderColor="border-t-emerald-500/50"
          />
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Atividade</SectionLabel>
        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            </div>
          ) : (
            <UsageChart data={usageData || []} title="Atividade da Plataforma" />
          )}
        </div>
      </div>
    </div>
  );
}
