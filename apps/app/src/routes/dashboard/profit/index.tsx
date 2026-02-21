import { StatsCard } from "@/components/cards/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfit } from "@/hooks/use-analytics";
import { useCharacters } from "@/hooks/use-characters";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Coins, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/profit/")({
  component: ProfitPage,
});

function ProfitPage() {
  const [days, setDays] = useState(7);
  const [characterId, setCharacterId] = useState<string | undefined>();
  const { data: characters } = useCharacters();
  const { data: profitData, isLoading } = useProfit({ days, characterId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Profit Calculator</h1>
        <div className="flex items-center gap-2">
          <select
            value={characterId ?? ""}
            onChange={(e) => setCharacterId(e.target.value || undefined)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            <option value="">All Characters</option>
            {characters?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatNumber(profitData?.totalRevenue ?? 0)}
          icon={Coins}
          description="Loot value"
        />
        <StatsCard
          title="Total Cost"
          value={formatNumber(profitData?.totalCost ?? 0)}
          icon={ShoppingCart}
          description="Supplies spent"
        />
        <StatsCard
          title="Net Profit"
          value={formatNumber(profitData?.netProfit ?? 0)}
          icon={DollarSign}
          description="Revenue - Cost"
          trend={
            profitData
              ? {
                  value:
                    profitData.totalRevenue > 0
                      ? Math.round((profitData.netProfit / profitData.totalRevenue) * 100)
                      : 0,
                  isPositive: (profitData?.netProfit ?? 0) >= 0,
                }
              : undefined
          }
        />
        <StatsCard
          title="Profit/Hour"
          value={formatNumber(profitData?.profitPerHour ?? 0)}
          icon={TrendingUp}
          description="Gold per hour"
        />
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Hunt Location</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400 text-right">Loot</TableHead>
                <TableHead className="text-slate-400 text-right">Supplies</TableHead>
                <TableHead className="text-slate-400 text-right">Profit</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitData?.sessions.map((s) => (
                <TableRow key={s.sessionId} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <Link
                      to="/dashboard/sessions/$sessionId"
                      params={{ sessionId: s.sessionId }}
                      className="text-white hover:text-emerald-400"
                    >
                      {s.huntLocation || "Unknown"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-300">{formatDuration(s.duration)}</TableCell>
                  <TableCell className="text-right text-yellow-400">
                    {formatNumber(s.lootValue)}
                  </TableCell>
                  <TableCell className="text-right text-red-400">
                    {formatNumber(s.suppliesCost)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      s.netProfit >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {s.netProfit >= 0 ? "+" : ""}
                    {formatNumber(s.netProfit)}
                  </TableCell>
                  <TableCell className="text-slate-500">{formatDate(s.startedAt)}</TableCell>
                </TableRow>
              ))}
              {(!profitData || profitData.sessions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    No completed sessions in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
