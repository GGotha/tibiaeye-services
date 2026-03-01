import { MetricCard } from "@/components/cards/metric-card";
import { RealtimeBots } from "@/components/charts/realtime-bots";
import { SectionLabel } from "@/components/ui/section-label";
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
    <div className="space-y-5">
      <div
        className="flex items-center justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Monitoramento
          </p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Bots ao Vivo</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-400">Ao vivo - Atualiza a cada 5s</span>
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Tempo Real</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <RealtimeBots />
          <MetricCard
            title="Sessoes Hoje"
            value={stats?.usage ? formatNumber(stats.usage.sessionsToday) : "-"}
            icon={Activity}
            description="Total iniciadas"
            borderColor="border-t-orange-500/50"
          />
          <MetricCard
            title="Pico Hoje"
            value={botsData ? formatNumber(botsData.peak) : "-"}
            icon={TrendingUp}
            description="Maximo simultaneo"
            borderColor="border-t-red-500/50"
          />
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Sobre o Monitoramento</SectionLabel>
        <div className="glass rounded-xl p-6 mt-2 text-slate-400 text-sm">
          <p>
            Esta pagina mostra estatisticas em tempo real dos bots ativos na plataforma. Os dados
            atualizam automaticamente a cada 5 segundos.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-400" />
              <span>Bots Online: Sessoes de hunt em execucao</span>
            </li>
            <li className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400" />
              <span>Sessoes Hoje: Total de sessoes iniciadas nas ultimas 24h</span>
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <span>Pico Hoje: Maior numero de bots simultaneos nas ultimas 24h</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
