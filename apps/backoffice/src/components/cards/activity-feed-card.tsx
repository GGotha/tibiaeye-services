import { getRelativeTime } from "@/lib/utils";
import { Key, Shield, UserPlus } from "lucide-react";

interface ActivityItem {
  type: "signup" | "license" | "session";
  description: string;
  time: string;
}

interface ActivityFeedCardProps {
  items: ActivityItem[];
}

const iconMap = {
  signup: UserPlus,
  license: Shield,
  session: Key,
};

const colorMap = {
  signup: "text-emerald-400 bg-emerald-500/10",
  license: "text-red-400 bg-red-500/10",
  session: "text-orange-400 bg-orange-500/10",
};

export function ActivityFeedCard({ items }: ActivityFeedCardProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-xs font-medium text-slate-400 mb-4">Atividade Recente</h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">Nenhuma atividade recente</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = iconMap[item.type];
            const color = colorMap[item.type];
            return (
              <div
                key={`${item.type}-${item.time}-${i}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
              >
                <div className={`p-1.5 rounded-lg ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item.description}</p>
                  <p className="text-xs text-slate-500">{getRelativeTime(item.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
