import { useActiveBotsCount } from "@/hooks/use-platform-analytics";
import { Activity } from "lucide-react";

export function RealtimeBots() {
  const { data, isLoading } = useActiveBotsCount();

  return (
    <div className="glass rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-400">Bots Online</span>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">Ao vivo</span>
        </div>
      </div>

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
              <p className="text-xs text-slate-500">Ativos agora</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Pico hoje</span>
              <span className="text-sm font-medium text-white">{data?.peak ?? 0}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
