import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KillsByCreature } from "@/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface KillsChartProps {
  data: KillsByCreature[];
}

export function KillsChart({ data }: KillsChartProps) {
  const topKills = [...data].sort((a, b) => b.totalKills - a.totalKills).slice(0, 10);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Kills by Creature</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topKills} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#64748b" tick={{ fill: "#64748b" }} />
            <YAxis
              dataKey="creatureName"
              type="category"
              width={120}
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="totalKills" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
