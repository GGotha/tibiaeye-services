import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KillsByCreature } from "@/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface KillsChartProps {
  data: KillsByCreature[];
}

const tooltipStyle = {
  background: "rgba(15, 23, 42, 0.85)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
};

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
            <defs>
              <linearGradient id="killsGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis
              dataKey="creatureName"
              type="category"
              width={120}
              stroke="#475569"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: "#94a3b8" }}
              cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
            />
            <Bar dataKey="totalKills" fill="url(#killsGradient)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
