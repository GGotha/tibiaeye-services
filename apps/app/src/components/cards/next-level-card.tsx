import { Card, CardContent } from "@/components/ui/card";
import { experienceForLevel } from "@/lib/tibia";
import { formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

function formatTimeToLevel(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface NextLevelCardProps {
  experience: number | null;
  level: number | null;
  xpPerHour: number;
}

export function NextLevelCard({ experience, level, xpPerHour }: NextLevelCardProps) {
  const hasData = experience != null && level != null && level > 0;
  const xpToNext = hasData ? experienceForLevel(level + 1) - experience : 0;
  const timeHours = hasData && xpPerHour > 0 ? xpToNext / xpPerHour : 0;
  const progressPercent = hasData
    ? Math.round(
        ((experience - experienceForLevel(level)) /
          (experienceForLevel(level + 1) - experienceForLevel(level))) *
          100
      )
    : 0;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-purple-400" />
          <div className="flex-1">
            <p className="text-sm text-slate-400">Next Level</p>
            <p className="text-2xl font-bold text-white">
              {hasData && xpPerHour > 0 ? formatTimeToLevel(timeHours) : "--"}
            </p>
            {hasData && (
              <div className="mt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Lv {level}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="mt-0.5 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {xpToNext > 0 && (
                  <p className="mt-1 text-xs text-slate-500">Faltam {formatNumber(xpToNext)} XP</p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
