import { formatNumber } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface UsersChartData {
  date: string;
  newUsers: number;
  activeUsers?: number;
}

interface UsersChartProps {
  data: UsersChartData[];
  title?: string;
}

export function UsersChart({ data, title = "Novos Usuarios" }: UsersChartProps) {
  return (
    <div className="glass gradient-border rounded-xl p-6">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              formatter={(value: number) => [formatNumber(value), "Novos Usuarios"]}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("pt-BR", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
            <Bar dataKey="newUsers" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
