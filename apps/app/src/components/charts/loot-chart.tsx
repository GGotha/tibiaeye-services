import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { LootSummary } from "@/types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface LootChartProps {
  data: LootSummary;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const tooltipStyle = {
  background: "rgba(15, 23, 42, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
};

export function LootChart({ data }: LootChartProps) {
  const topItems = [...data.items].sort((a, b) => b.totalValue - a.totalValue).slice(0, 6);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Loot Distribution</CardTitle>
        <p className="text-2xl font-bold text-yellow-400">{formatNumber(data.totalValue)} gold</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topItems}
              dataKey="totalValue"
              nameKey="itemName"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: "#475569" }}
            >
              {topItems.map((item, index) => (
                <Cell
                  key={item.itemName}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(15, 23, 42, 0.5)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatNumber(value)}
              contentStyle={tooltipStyle}
            />
            <Legend
              wrapperStyle={{ color: "#94a3b8" }}
              formatter={(value) => <span className="text-slate-400">{value}</span>}
            />
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-white text-lg font-bold"
            >
              {formatNumber(data.totalValue)}
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-slate-500 text-xs"
            >
              gold
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
