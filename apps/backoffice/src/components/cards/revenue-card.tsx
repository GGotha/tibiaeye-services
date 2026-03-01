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
  const arr = mrr * 12;

  return (
    <div className="glass gradient-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-400">Receita Recorrente Mensal</span>
        <DollarSign className="h-4 w-4 text-red-400" />
      </div>

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
        <span className="text-xs text-slate-500">vs mes anterior</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
        <div>
          <p className="text-xs text-slate-500">ARR</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(arr)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Assinaturas</p>
          <p className="text-lg font-semibold text-white">{activeSubscriptions}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Churn</p>
          <p className="text-lg font-semibold text-white">{churnRate.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
