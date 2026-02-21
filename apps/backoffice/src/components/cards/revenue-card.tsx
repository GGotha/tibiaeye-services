import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface RevenueCardProps {
  mrr: number;
  mrrGrowth: number;
  activeSubscriptions: number;
  churnRate: number;
}

export function RevenueCard({ mrr, mrrGrowth, activeSubscriptions, churnRate }: RevenueCardProps) {
  const isPositiveGrowth = mrrGrowth >= 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          Monthly Recurring Revenue
        </CardTitle>
        <DollarSign className="h-4 w-4 text-red-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{formatCurrency(mrr)}</div>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`flex items-center text-xs font-medium ${
              isPositiveGrowth ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositiveGrowth ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {formatPercentage(mrrGrowth)}
          </span>
          <span className="text-xs text-slate-500">vs last month</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Active Subscriptions</p>
            <p className="text-lg font-semibold text-white">{activeSubscriptions}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Churn Rate</p>
            <p className="text-lg font-semibold text-white">{churnRate.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
