import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveBotsCount } from "@/hooks/use-platform-analytics";
import { Activity } from "lucide-react";

export function RealtimeBots() {
  const { data, isLoading } = useActiveBotsCount();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">Bots Online</CardTitle>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-4xl font-bold text-white">{data?.count ?? 0}</div>
                <p className="text-xs text-slate-500">Currently active</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Peak Today</span>
                <span className="text-sm font-medium text-white">{data?.peak ?? 0}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
