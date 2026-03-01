import { cn, formatPercentage } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: number;
  trendLabel?: string;
  borderColor?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
  borderColor = "border-t-red-500/50",
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 border-t-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5",
        borderColor
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <Icon className="h-4 w-4 text-red-400" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center text-xs font-medium",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {formatPercentage(trend)}
          </span>
        )}
        {(description || trendLabel) && (
          <span className="text-xs text-slate-500">{trendLabel || description}</span>
        )}
      </div>
    </div>
  );
}
