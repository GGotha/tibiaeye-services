import { ActiveSessionBanner } from "@/components/cards/active-session-banner";
import { BoostedCard } from "@/components/cards/boosted-card";
import { BotStatusCard } from "@/components/cards/bot-status-card";
import { LicenseStatusCard } from "@/components/cards/license-status-card";
import { NextLevelCard } from "@/components/cards/next-level-card";
import { RashidCard } from "@/components/cards/rashid-card";
import { SessionCard } from "@/components/cards/session-card";
import { StatsCard } from "@/components/cards/stats-card";
import { XPChart } from "@/components/charts/xp-chart";
import { LiveMap } from "@/components/map/live-map";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useExperienceHourly } from "@/hooks/use-analytics";
import { useLicenseStatus } from "@/hooks/use-license";
import { useNotifications } from "@/hooks/use-notifications";
import { useRealtimeSession } from "@/hooks/use-realtime";
import { useActiveSession, useSessions } from "@/hooks/use-sessions";
import { formatDuration, formatNumber } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ChevronRight,
  Clock,
  Coins,
  Map as MapIcon,
  Moon,
  Sword,
  Users,
} from "lucide-react";

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
  const { data: activeSession } = useActiveSession();
  const { data: sessionsData } = useSessions({ limit: 5 });
  const { data: licenseStatus } = useLicenseStatus();
  const { data: stats } = useDashboardStats();
  const { data: experienceData } = useExperienceHourly(activeSession?.id);
  const { position, botStatus, lastEvent, isConnected } = useRealtimeSession(
    activeSession?.id ?? "",
  );
  useNotifications(activeSession?.id, botStatus, lastEvent, isConnected);

  const recentSessions =
    sessionsData?.data?.filter((s) => s.status !== "active") ?? [];

  const isLive = !!activeSession;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div
        className="flex items-end justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            {getGreeting()}
          </p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-slate-700/60 text-slate-300 hover:border-emerald-500/40 hover:text-white"
          >
            <Link to="/dashboard/live-map">
              <MapIcon className="h-3.5 w-3.5 mr-1.5" />
              Mapa
            </Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-emerald-500/90 hover:bg-emerald-500 text-black font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <Link to="/dashboard/characters">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Characters
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Active Session Banner ── */}
      {isLive && (
        <div
          className="opacity-0 animate-slide-up"
          style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
        >
          <ActiveSessionBanner session={activeSession} />
        </div>
      )}

      {/* ── Daily Intel: Boosted + Rashid (always visible, prominent) ── */}
      <div
        className="opacity-0 animate-fade-in"
        style={{
          animationDelay: isLive ? "120ms" : "60ms",
          animationFillMode: "forwards",
        }}
      >
        <SectionLabel>Hoje no Tibia</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <BoostedCard />
          <RashidCard />
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div
        className="opacity-0 animate-fade-in"
        style={{
          animationDelay: isLive ? "180ms" : "120ms",
          animationFillMode: "forwards",
        }}
      >
        <SectionLabel>Resumo do Dia</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <StatsCard
            title="XP por Hora"
            value={stats ? formatNumber(stats.xpPerHour) : "-"}
            icon={Activity}
            description="Media da sessao"
          />
          <StatsCard
            title="Kills Hoje"
            value={stats ? formatNumber(stats.killsToday) : "-"}
            icon={Sword}
          />
          <StatsCard
            title="Valor do Loot"
            value={stats ? formatNumber(stats.lootValueToday) : "-"}
            icon={Coins}
            description="Gold hoje"
          />
          <StatsCard
            title="Tempo Online"
            value={stats ? formatDuration(stats.onlineTimeToday) : "-"}
            icon={Clock}
            description="Hoje"
          />
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div
        className="opacity-0 animate-fade-in"
        style={{
          animationDelay: isLive ? "240ms" : "180ms",
          animationFillMode: "forwards",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ── Left: Chart + Map / Idle state ── */}
          <div className="lg:col-span-8 space-y-5">
            {isLive && botStatus && (
              <BotStatusCard
                hpPercent={botStatus.hpPercent}
                manaPercent={botStatus.manaPercent}
                targetCreature={botStatus.targetCreature}
                currentTask={botStatus.currentTask}
                speed={botStatus.speed}
                stamina={botStatus.stamina}
                capacity={botStatus.capacity}
              />
            )}

            <XPChart
              data={experienceData?.dataPoints ?? []}
              averageXpPerHour={
                experienceData?.xpPerHourAverage ?? stats?.xpPerHour ?? 0
              }
            />

            {isLive ? (
              <LiveMap
                position={position}
                isConnected={isConnected}
                compact
              />
            ) : (
              <IdleCard />
            )}
          </div>

          {/* ── Right Sidebar: Next Level + License ── */}
          <div className="lg:col-span-4 space-y-4">
            {isLive && botStatus && (
              <NextLevelCard
                experience={botStatus.experience ?? null}
                level={botStatus.level ?? null}
                xpPerHour={stats?.xpPerHour ?? 0}
              />
            )}

            <LicenseStatusCard
              license={licenseStatus}
              onGetLicense={() => window.open("/pricing", "_blank")}
            />
          </div>
        </div>
      </div>

      {/* ── Recent Sessions ── */}
      <div
        className="opacity-0 animate-fade-in"
        style={{
          animationDelay: isLive ? "300ms" : "240ms",
          animationFillMode: "forwards",
        }}
      >
        <div className="flex items-center justify-between">
          <SectionLabel>Sessoes Recentes</SectionLabel>
          <Link
            to="/dashboard/sessions"
            className="text-xs font-medium text-emerald-400/80 hover:text-emerald-300 inline-flex items-center gap-0.5 transition-colors"
          >
            Ver todas
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {recentSessions.slice(0, 3).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
            <p className="text-sm text-slate-500">
              Nenhuma sessao recente. Inicie uma hunt para ver seus dados aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section label component ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
      {children}
    </h2>
  );
}

/* ── Idle state when bot is offline ── */
function IdleCard() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-emerald-950/10 pointer-events-none" />

      <div className="relative flex flex-col items-center text-center space-y-3">
        <div className="rounded-full bg-slate-800/60 p-4">
          <Moon className="h-7 w-7 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">Bot offline</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Inicie o bot para ver o mapa ao vivo, status em tempo real e
            acompanhar sua hunt.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="mt-2 border-slate-700/60 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400"
        >
          <Link to="/dashboard/sessions">Ver historico</Link>
        </Button>
      </div>
    </div>
  );
}
