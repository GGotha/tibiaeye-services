import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { KillsByCreature } from "@/types";

interface KillsTableProps {
  kills: KillsByCreature[];
}

export function KillsTable({ kills }: KillsTableProps) {
  const sortedKills = [...kills].sort((a, b) => b.totalKills - a.totalKills);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Creature</TableHead>
            <TableHead className="text-slate-400 text-right">Kills</TableHead>
            <TableHead className="text-slate-400 text-right">Total XP</TableHead>
            <TableHead className="text-slate-400 text-right">Avg XP/Kill</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedKills.map((kill) => (
            <TableRow key={kill.creatureName} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="font-medium text-white">{kill.creatureName}</TableCell>
              <TableCell className="text-right text-slate-300">
                {formatNumber(kill.totalKills)}
              </TableCell>
              <TableCell className="text-right text-emerald-400">
                {formatNumber(kill.totalExperience)}
              </TableCell>
              <TableCell className="text-right text-slate-400">
                {formatNumber(Math.round(kill.totalExperience / kill.totalKills))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
