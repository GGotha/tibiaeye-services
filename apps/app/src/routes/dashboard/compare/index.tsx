import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompareSessions } from "@/hooks/use-analytics";
import { useSessions } from "@/hooks/use-sessions";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/compare/")({
  component: ComparePage,
});

function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: sessionsData } = useSessions({ limit: 50, status: "completed" });
  const { data: compareData } = useCompareSessions(selectedIds);

  const toggleSession = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const sessions = sessionsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Compare Sessions</h1>
        <span className="text-sm text-slate-400">{selectedIds.length}/5 selected</span>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <p className="text-sm text-slate-400 mb-3">Select 2-5 sessions to compare:</p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                size="sm"
                onClick={() => toggleSession(s.id)}
                className={cn(
                  "border-slate-700 text-sm",
                  selectedIds.includes(s.id) &&
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}
              >
                {s.characterName} - {s.huntLocation || "Unknown"} ({formatDate(s.startedAt)})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {compareData && compareData.sessions.length >= 2 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Metric</TableHead>
                  {compareData.sessions.map((s) => (
                    <TableHead key={s.sessionId} className="text-slate-400 text-center">
                      <div>{s.characterName}</div>
                      <div className="text-xs text-slate-500">{s.huntLocation || "Unknown"}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <CompareRow
                  label="Duration"
                  values={compareData.sessions.map((s) => formatDuration(s.duration))}
                />
                <CompareRow
                  label="Total Kills"
                  values={compareData.sessions.map((s) => formatNumber(s.totalKills))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.totalKills)}
                />
                <CompareRow
                  label="XP/Hour"
                  values={compareData.sessions.map((s) => formatNumber(s.xpPerHour))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.xpPerHour)}
                />
                <CompareRow
                  label="Kills/Hour"
                  values={compareData.sessions.map((s) => formatNumber(s.killsPerHour))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.killsPerHour)}
                />
                <CompareRow
                  label="Loot Value"
                  values={compareData.sessions.map((s) => formatNumber(s.totalLootValue))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.totalLootValue)}
                />
                <CompareRow
                  label="Loot/Hour"
                  values={compareData.sessions.map((s) => formatNumber(s.lootPerHour))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.lootPerHour)}
                />
                <CompareRow
                  label="Total XP"
                  values={compareData.sessions.map((s) => formatNumber(s.totalExperience))}
                  highlight="max"
                  rawValues={compareData.sessions.map((s) => s.totalExperience)}
                />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <div className="text-center py-8 text-slate-400">
          Select at least 2 sessions to compare.
        </div>
      )}
    </div>
  );
}

function CompareRow({
  label,
  values,
  highlight,
  rawValues,
}: {
  label: string;
  values: string[];
  highlight?: "max";
  rawValues?: number[];
}) {
  const maxIdx = rawValues ? rawValues.indexOf(Math.max(...rawValues)) : -1;

  return (
    <TableRow className="border-slate-800 hover:bg-slate-800/50">
      <TableCell className="font-medium text-slate-300">{label}</TableCell>
      {values.map((v, i) => (
        <TableCell
          key={`${label}-${i}`}
          className={cn(
            "text-center",
            highlight === "max" && i === maxIdx ? "text-emerald-400 font-semibold" : "text-white"
          )}
        >
          {v}
        </TableCell>
      ))}
    </TableRow>
  );
}
