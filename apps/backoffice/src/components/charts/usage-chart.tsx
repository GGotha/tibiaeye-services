import { formatNumber } from "@/lib/utils";
import type { UsageData } from "@/types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface UsageChartProps {
  data: UsageData[];
  title?: string;
}

export function UsageChart({ data, title = "Uso da Plataforma" }: UsageChartProps) {
  return (
    <div className="glass gradient-border rounded-xl p-6">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("pt-BR", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Sessoes"
            />
            <Line
              type="monotone"
              dataKey="apiRequests"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Requisicoes API"
            />
            <Line
              type="monotone"
              dataKey="uniqueUsers"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              name="Usuarios Unicos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
