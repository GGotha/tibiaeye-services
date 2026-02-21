import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";
import { Link } from "@tanstack/react-router";
import { Eye, Trash } from "lucide-react";

interface SessionsTableProps {
  sessions: Session[];
  onDelete?: (id: string) => void;
}

export function SessionsTable({ sessions, onDelete }: SessionsTableProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Character</TableHead>
            <TableHead className="text-slate-400">Location</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Duration</TableHead>
            <TableHead className="text-slate-400">XP/h</TableHead>
            <TableHead className="text-slate-400">Kills</TableHead>
            <TableHead className="text-slate-400">Date</TableHead>
            <TableHead className="text-slate-400 w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const duration = session.endedAt
              ? Math.round(
                  (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) /
                    1000
                )
              : Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000);

            return (
              <TableRow key={session.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-white">{session.characterName}</TableCell>
                <TableCell className="text-slate-300">{session.huntLocation || "-"}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      session.status === "active" &&
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      session.status === "completed" &&
                        "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      session.status === "crashed" && "bg-red-500/10 text-red-400 border-red-500/20"
                    )}
                  >
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-300">{formatDuration(duration)}</TableCell>
                <TableCell className="text-emerald-400">
                  {formatNumber(session.xpPerHour)}
                </TableCell>
                <TableCell className="text-slate-300">{formatNumber(session.totalKills)}</TableCell>
                <TableCell className="text-slate-400">
                  {formatDateTime(session.startedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link to="/dashboard/sessions/$sessionId" params={{ sessionId: session.id }}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {onDelete && session.status !== "active" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => onDelete(session.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
