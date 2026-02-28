import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface XPChartProps {
  data: Array<{
    timestamp: string;
    xpPerHour: number;
    level: number;
  }>;
  averageXpPerHour: number;
}

const tooltipStyle = {
  background: "rgba(15, 23, 42, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
};

export function XPChart({ data, averageXpPerHour }: XPChartProps) {
  const formatXp = (value: number) => {
    if (value == null) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Experience per Hour</CardTitle>
        <p className="text-2xl font-bold text-emerald-400">{formatXp(averageXpPerHour)} XP/h</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
              stroke="#475569"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis tickFormatter={formatXp} stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(v: number) => [`${formatXp(v)} XP/h`, "XP/h"]}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="xpPerHour"
              fill="url(#xpGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="xpPerHour"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#10b981", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
