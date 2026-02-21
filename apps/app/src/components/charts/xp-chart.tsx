import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
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

export function XPChart({ data, averageXpPerHour }: XPChartProps) {
  const formatXp = (value: number) => {
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
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
              stroke="#64748b"
              tick={{ fill: "#64748b" }}
            />
            <YAxis tickFormatter={formatXp} stroke="#64748b" tick={{ fill: "#64748b" }} />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString()}
              formatter={(v: number) => [`${formatXp(v)} XP/h`, "XP/h"]}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Line
              type="monotone"
              dataKey="xpPerHour"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
