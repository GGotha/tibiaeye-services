import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { LootSummary } from "@/types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface LootChartProps {
  data: LootSummary;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: "#64748b" }}
            >
              {topItems.map((item, index) => (
                <Cell key={item.itemName} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatNumber(value)}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Legend
              wrapperStyle={{ color: "#94a3b8" }}
              formatter={(value) => <span className="text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
