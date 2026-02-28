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
import { Activity, Clock, Coins, Map as MapIcon, Sword, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { data: activeSession } = useActiveSession();
  const { data: sessionsData } = useSessions({ limit: 5 });
  const { data: licenseStatus } = useLicenseStatus();
  const { data: stats } = useDashboardStats();
  const { data: experienceData } = useExperienceHourly(activeSession?.id);
  const { position, botStatus, lastEvent, isConnected } = useRealtimeSession(
    activeSession?.id ?? ""
  );
  useNotifications(activeSession?.id, botStatus, lastEvent, isConnected);

  const recentSessions = sessionsData?.data?.filter((s) => s.status !== "active") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="border-slate-700">
            <Link to="/dashboard/live-map">
              <MapIcon className="h-4 w-4 mr-2" />
              Live Map
            </Link>
          </Button>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-black">
            <Link to="/dashboard/characters">
              <Users className="h-4 w-4 mr-2" />
              Characters
            </Link>
          </Button>
        </div>
      </div>

      {activeSession && <ActiveSessionBanner session={activeSession} />}

      {activeSession && botStatus && (
        <BotStatusCard
          hpPercent={botStatus.hpPercent}
          manaPercent={botStatus.manaPercent}
          targetCreature={botStatus.targetCreature}
          currentTask={botStatus.currentTask}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="XP per Hour"
          value={stats ? formatNumber(stats.xpPerHour) : "-"}
          icon={Activity}
          description="Current session average"
        />
        <StatsCard
          title="Kills Today"
          value={stats ? formatNumber(stats.killsToday) : "-"}
          icon={Sword}
        />
        <StatsCard
          title="Loot Value"
          value={stats ? formatNumber(stats.lootValueToday) : "-"}
          icon={Coins}
          description="Gold earned today"
        />
        <StatsCard
          title="Time Online"
          value={stats ? formatDuration(stats.onlineTimeToday) : "-"}
          icon={Clock}
          description="Today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <XPChart
            data={experienceData?.dataPoints ?? []}
            averageXpPerHour={experienceData?.xpPerHourAverage ?? stats?.xpPerHour ?? 0}
          />
          {activeSession && <LiveMap position={position} isConnected={isConnected} compact />}
        </div>
        <div className="space-y-4">
          {activeSession && botStatus && (
            <NextLevelCard
              experience={botStatus.experience ?? null}
              level={botStatus.level ?? null}
              xpPerHour={stats?.xpPerHour ?? 0}
            />
          )}
          <BoostedCard />
          <RashidCard />
          <LicenseStatusCard
            license={licenseStatus}
            onGetLicense={() => window.open("/pricing", "_blank")}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
          <Link
            to="/dashboard/sessions"
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View all
          </Link>
        </div>
        {recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions.slice(0, 3).map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            No recent sessions. Start hunting to see your stats here!
          </div>
        )}
      </div>
    </div>
  );
}
