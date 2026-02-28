import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

const iconColorMap: Record<string, { text: string; bg: string; border: string }> = {
  Activity: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-t-emerald-500" },
  Sword: { text: "text-red-400", bg: "bg-red-400/10", border: "border-t-red-500" },
  Coins: { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-t-yellow-500" },
  Clock: { text: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-t-cyan-500" },
};

function getIconColors(icon: LucideIcon) {
  const name = icon.displayName || icon.name || "";
  return iconColorMap[name] || { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-t-emerald-500" };
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  const colors = getIconColors(Icon);

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-slate-700 border-t-2",
        colors.border,
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={cn("rounded-lg p-2", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-sm font-medium",
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
