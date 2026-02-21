import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
  return (
    <div className={cn("rounded-xl border border-slate-800 bg-slate-900/50 p-6", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <Icon className="h-5 w-5 text-slate-500" />
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}
