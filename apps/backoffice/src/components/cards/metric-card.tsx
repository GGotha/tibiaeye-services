import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendLabel,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-red-400" />
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
