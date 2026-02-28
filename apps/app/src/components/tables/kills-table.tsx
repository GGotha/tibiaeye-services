import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TibiaSprite } from "@/components/ui/tibia-sprite";
import { creatureSpriteUrl } from "@/lib/tibia-sprites";
import { formatNumber } from "@/lib/utils";
import type { KillsByCreature } from "@/types";
import { useMemo, useState } from "react";

interface KillsTableProps {
  kills: KillsByCreature[];
}

type SortField = "totalKills" | "totalExperience" | "avgXp" | "xpPercent";

export function KillsTable({ kills }: KillsTableProps) {
  const [sortField, setSortField] = useState<SortField>("totalExperience");
  const [sortAsc, setSortAsc] = useState(false);

  const totalXpAll = kills.reduce((sum, k) => sum + k.totalExperience, 0);

  const sortedKills = useMemo(() => {
    const sorted = [...kills].sort((a, b) => {
      let va: number;
      let vb: number;
      if (sortField === "avgXp") {
        va = a.totalKills > 0 ? a.totalExperience / a.totalKills : 0;
        vb = b.totalKills > 0 ? b.totalExperience / b.totalKills : 0;
      } else {
        va = a[sortField === "xpPercent" ? "totalExperience" : sortField];
        vb = b[sortField === "xpPercent" ? "totalExperience" : sortField];
      }
      return sortAsc ? va - vb : vb - va;
    });
    return sorted;
  }, [kills, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
      return;
    }
    setSortField(field);
    setSortAsc(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 text-[10px]">
      {sortField === field ? (sortAsc ? "\u25B2" : "\u25BC") : ""}
    </span>
  );

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Creature</TableHead>
            <TableHead
              className="text-slate-400 text-right cursor-pointer hover:text-white select-none"
              onClick={() => handleSort("totalKills")}
            >
              Kills<SortIcon field="totalKills" />
            </TableHead>
            <TableHead
              className="text-slate-400 text-right cursor-pointer hover:text-white select-none"
              onClick={() => handleSort("totalExperience")}
            >
              Total XP<SortIcon field="totalExperience" />
            </TableHead>
            <TableHead
              className="text-slate-400 text-right cursor-pointer hover:text-white select-none"
              onClick={() => handleSort("xpPercent")}
            >
              XP %<SortIcon field="xpPercent" />
            </TableHead>
            <TableHead
              className="text-slate-400 text-right cursor-pointer hover:text-white select-none"
              onClick={() => handleSort("avgXp")}
            >
              Avg XP/Kill<SortIcon field="avgXp" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedKills.map((kill) => {
            const xpPercent = totalXpAll > 0 ? (kill.totalExperience / totalXpAll * 100) : 0;
            return (
              <TableRow key={kill.creatureName} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-white">
                  <div className="flex items-center gap-2">
                    <TibiaSprite
                      src={creatureSpriteUrl(kill.creatureName)}
                      alt={kill.creatureName}
                      size="sm"
                    />
                    {kill.creatureName}
                  </div>
                </TableCell>
                <TableCell className="text-right text-slate-300">
                  {formatNumber(kill.totalKills)}
                </TableCell>
                <TableCell className="text-right text-emerald-400">
                  {formatNumber(kill.totalExperience)}
                </TableCell>
                <TableCell className="text-right text-cyan-400">
                  {xpPercent.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right text-slate-400">
                  {formatNumber(Math.round(kill.totalExperience / kill.totalKills))}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
