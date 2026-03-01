import { ActivityFeedCard } from "@/components/cards/activity-feed-card";
import { ConversionFunnelCard } from "@/components/cards/conversion-funnel-card";
import { LicenseStatsCard } from "@/components/cards/license-stats-card";
import { MetricCard } from "@/components/cards/metric-card";
import { RevenueCard } from "@/components/cards/revenue-card";
import { RealtimeBots } from "@/components/charts/realtime-bots";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SectionLabel } from "@/components/ui/section-label";
import { useLicenseStats } from "@/hooks/use-licenses";
import {
  useActiveBotsCount,
  usePlatformStats,
  useRevenueData,
} from "@/hooks/use-platform-analytics";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bot, DollarSign, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "Boa madrugada";
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function DashboardOverview() {
  const { data: stats } = usePlatformStats();
  const { data: revenueData } = useRevenueData("30d");
  const { data: licenseStats } = useLicenseStats();
  const { data: botsData } = useActiveBotsCount();

  const mockActivity = [
    {
      type: "signup" as const,
      description: "Novo usuario registrado",
      time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      type: "license" as const,
      description: "Licenca Pro ativada",
      time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      type: "session" as const,
      description: "Sessao de hunt iniciada",
      time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];

  const funnelSteps = [
    { label: "Free", count: stats?.users?.total ?? 0, color: "#64748b" },
    { label: "Trial", count: Math.round((stats?.users?.total ?? 0) * 0.3), color: "#f59e0b" },
    { label: "Paid", count: stats?.subscriptions?.total ?? 0, color: "#22c55e" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="flex items-end justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Painel Administrativo</h1>
        </div>
      </div>

      {/* Metricas Principais */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Metricas Principais</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="Total Usuarios"
            value={stats?.users?.total != null ? formatNumber(stats.users.total) : "-"}
            icon={Users}
            trend={stats?.users?.growthRate}
            trendLabel="vs mes anterior"
            borderColor="border-t-blue-500/50"
          />
          <MetricCard
            title="Ativos Hoje"
            value={stats?.users?.activeToday != null ? formatNumber(stats.users.activeToday) : "-"}
            icon={Activity}
            description="Ultimas 24h"
            borderColor="border-t-emerald-500/50"
          />
          <MetricCard
            title="MRR"
            value={
              stats?.subscriptions?.mrr != null ? formatCurrency(stats.subscriptions.mrr) : "-"
            }
            icon={DollarSign}
            trend={stats?.subscriptions?.mrrGrowth}
            trendLabel="vs mes anterior"
            borderColor="border-t-orange-500/50"
          />
          <MetricCard
            title="Bots Online"
            value={botsData?.count != null ? formatNumber(botsData.count) : "-"}
            icon={Bot}
            description={botsData?.peak != null ? `Pico: ${botsData.peak}` : undefined}
            borderColor="border-t-red-500/50"
          />
        </div>
      </div>

      {/* Receita */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Receita</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
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
      </div>

      {/* Visao Geral */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "180ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Visao Geral</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData || []} />
          </div>
          <div>{licenseStats && <LicenseStatsCard stats={licenseStats} />}</div>
        </div>
      </div>

      {/* Atividade Recente */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Atividade Recente</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          <ActivityFeedCard items={mockActivity} />
          <ConversionFunnelCard steps={funnelSteps} />
        </div>
      </div>
    </div>
  );
}
