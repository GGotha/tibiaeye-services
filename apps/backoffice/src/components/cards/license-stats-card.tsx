import { Progress } from "@/components/ui/progress";
import type { LicenseStats } from "@/types";
import { AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";

interface LicenseStatsCardProps {
  stats: LicenseStats;
}

export function LicenseStatsCard({ stats }: LicenseStatsCardProps) {
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;

  return (
    <div className="gradient-border rounded-xl bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-400">Visao Geral de Licencas</span>
        <Shield className="h-4 w-4 text-red-400" />
      </div>

      <div className="text-3xl font-bold text-white">{stats.total}</div>
      <p className="text-xs text-slate-500">Total de licencas</p>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">Ativas</span>
            <span className="text-emerald-400">{stats.active}</span>
          </div>
          <div className="progress-shimmer rounded-full">
            <Progress value={activePercentage} className="h-2 bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-400" />
            </div>
            <p className="text-lg font-semibold text-yellow-400">{stats.expiringThisWeek}</p>
            <p className="text-xs text-slate-500">Expirando</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-400">{stats.expired}</p>
            <p className="text-xs text-slate-500">Expiradas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-red-400">{stats.revoked}</p>
            <p className="text-xs text-slate-500">Revogadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
