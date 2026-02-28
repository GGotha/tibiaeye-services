import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Session } from "@/types";
import { Link } from "@tanstack/react-router";
import { Activity, Clock, Coins, Sword } from "lucide-react";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const duration = Math.max(
    0,
    session.endedAt
      ? Math.round(
          (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000
        )
      : Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)
  );

  return (
    <Link to="/dashboard/sessions/$sessionId" params={{ sessionId: session.id }}>
      <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{session.characterName}</h3>
              <p className="text-sm text-slate-400">{session.huntLocation || "Unknown location"}</p>
            </div>
            <Badge
              className={cn(
                session.status === "active" &&
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                session.status === "completed" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                session.status === "crashed" && "bg-red-500/10 text-red-400 border-red-500/20"
              )}
            >
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <Clock className="h-4 w-4 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-white">{formatDuration(duration)}</p>
            </div>
            <div className="text-center">
              <Sword className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-white">{formatNumber(session.totalKills)}</p>
            </div>
            <div className="text-center">
              <Activity className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-white">
                {formatNumber(Number(session.totalExperience))}
              </p>
            </div>
            <div className="text-center">
              <Coins className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-white">
                {formatNumber(session.totalLootValue)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">{formatDateTime(session.startedAt)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
