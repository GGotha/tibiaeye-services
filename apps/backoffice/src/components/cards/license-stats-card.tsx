import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LicenseStats } from "@/types";
import { Shield } from "lucide-react";

interface LicenseStatsCardProps {
  stats: LicenseStats;
}

export function LicenseStatsCard({ stats }: LicenseStatsCardProps) {
  const activePercentage = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">License Overview</CardTitle>
        <Shield className="h-4 w-4 text-red-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{stats.total}</div>
        <p className="text-xs text-slate-500">Total Licenses</p>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">Active</span>
              <span className="text-emerald-400">{stats.active}</span>
            </div>
            <Progress value={activePercentage} className="h-2 bg-slate-800" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800">
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-400">{stats.expiringThisWeek}</p>
              <p className="text-xs text-slate-500">Expiring Soon</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-400">{stats.expired}</p>
              <p className="text-xs text-slate-500">Expired</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-400">{stats.revoked}</p>
              <p className="text-xs text-slate-500">Revoked</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
