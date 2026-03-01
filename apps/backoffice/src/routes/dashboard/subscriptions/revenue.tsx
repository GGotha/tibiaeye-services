import { MetricCard } from "@/components/cards/metric-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SectionLabel } from "@/components/ui/section-label";
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

  const arr = stats?.subscriptions?.mrr ? stats.subscriptions.mrr * 12 : 0;

  return (
    <div className="space-y-5">
      <div
        className="flex items-center justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Financeiro</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Receita</h1>
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
        <SectionLabel>Metricas de Receita</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="MRR"
            value={stats?.subscriptions ? formatCurrency(stats.subscriptions.mrr) : "-"}
            icon={DollarSign}
            trend={stats?.subscriptions?.mrrGrowth}
            trendLabel="vs mes anterior"
            borderColor="border-t-emerald-500/50"
          />
          <MetricCard
            title="ARR"
            value={arr > 0 ? formatCurrency(arr) : "-"}
            icon={TrendingUp}
            description="Receita anual"
            borderColor="border-t-blue-500/50"
          />
          <MetricCard
            title="Churn"
            value={stats?.subscriptions ? `${stats.subscriptions.churnRate.toFixed(1)}%` : "-"}
            icon={TrendingDown}
            description="Churn mensal"
            borderColor="border-t-red-500/50"
          />
          <MetricCard
            title="Assinantes"
            value={stats?.subscriptions ? formatNumber(stats.subscriptions.total) : "-"}
            icon={Users}
            description="Pagantes ativos"
            borderColor="border-t-orange-500/50"
          />
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Tendencia</SectionLabel>
        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            </div>
          ) : (
            <RevenueChart data={revenueData || []} title="MRR ao Longo do Tempo" />
          )}
        </div>
      </div>
    </div>
  );
}
