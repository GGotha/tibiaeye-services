interface FunnelStep {
  label: string;
  count: number;
  color: string;
}

interface ConversionFunnelCardProps {
  steps: FunnelStep[];
}

export function ConversionFunnelCard({ steps }: ConversionFunnelCardProps) {
  const maxCount = steps.length > 0 ? Math.max(...steps.map((s) => s.count)) : 1;

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xs font-medium text-slate-400 mb-4">Funil de Conversao</h3>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const percentage = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
          const conversionRate =
            i > 0 && steps[i - 1].count > 0
              ? ((step.count / steps[i - 1].count) * 100).toFixed(1)
              : null;

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-300">{step.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{step.count}</span>
                  {conversionRate && (
                    <span className="text-xs text-slate-500">({conversionRate}%)</span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full progress-shimmer transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
