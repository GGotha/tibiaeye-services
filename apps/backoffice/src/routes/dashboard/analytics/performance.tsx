import { MetricCard } from "@/components/cards/metric-card";
import { SectionLabel } from "@/components/ui/section-label";
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

  const healthItems = [
    { name: "Servidor API", status: "Saudavel", color: "bg-emerald-500" },
    { name: "Banco de Dados", status: "Conectado", color: "bg-emerald-500" },
    { name: "WebSocket", status: "Ativo", color: "bg-emerald-500" },
    { name: "Gateway de Pagamento", status: "Ativo", color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-5">
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Monitoramento
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Performance</h1>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Metricas</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="Requisicoes API"
            value={stats?.usage ? formatNumber(stats.usage.apiRequestsToday) : "-"}
            icon={Database}
            description="Total hoje"
            borderColor="border-t-orange-500/50"
          />
          <MetricCard
            title="Usuarios Ativos"
            value={stats?.users ? formatNumber(stats.users.activeToday) : "-"}
            icon={Activity}
            description="Ativos hoje"
            borderColor="border-t-emerald-500/50"
          />
          <MetricCard
            title="Sessoes Hoje"
            value={stats?.usage ? formatNumber(stats.usage.sessionsToday) : "-"}
            icon={Zap}
            description="Sessoes de hunt"
            borderColor="border-t-red-500/50"
          />
          <MetricCard
            title="Pico Concorrente"
            value={stats?.usage ? formatNumber(stats.usage.peakConcurrentBots) : "-"}
            icon={Clock}
            description="Maximo hoje"
            borderColor="border-t-blue-500/50"
          />
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <div>
          <SectionLabel>Saude do Sistema</SectionLabel>
          <div className="glass rounded-xl p-6 mt-2 space-y-3">
            {healthItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color} animate-pulse`} />
                  <span className="text-slate-300 text-sm">{item.name}</span>
                </div>
                <span className="text-emerald-400 text-sm">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Alertas Recentes</SectionLabel>
          <div className="glass rounded-xl p-6 mt-2">
            <div className="text-center py-8 text-slate-400">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Nenhum alerta recente</p>
              <p className="text-xs text-slate-500 mt-1">Todos os sistemas operando normalmente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
