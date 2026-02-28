import type { RouteSuggestions } from "@/types";
import {
  AlertTriangle,
  ArrowLeftRight,
  Layers,
  Route,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

interface AiSuggestionsProps {
  data: RouteSuggestions | null;
  isLoading: boolean;
  onRequestAnalysis: () => void;
  onSuggestionClick?: (segmentFrom: number, segmentTo: number) => void;
}

const TYPE_ICONS: Record<string, typeof Zap> = {
  slow_segment: AlertTriangle,
  backtracking: ArrowLeftRight,
  floor_optimization: Layers,
  waypoint_redundant: Trash2,
  reorder: Route,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function ScoreBar({ score }: { score: number }) {
  const clampedScore = Math.max(1, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;
  const color =
    clampedScore >= 7
      ? "bg-emerald-500"
      : clampedScore >= 4
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-bold text-white">{clampedScore}/10</span>
    </div>
  );
}

export function AiSuggestions({
  data,
  isLoading,
  onRequestAnalysis,
  onSuggestionClick,
}: AiSuggestionsProps) {
  if (!data && !isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-8">
        <Sparkles className="h-8 w-8 text-violet-400" />
        <p className="text-center text-sm text-slate-400">
          Get AI-powered suggestions to optimize your route
        </p>
        <button
          type="button"
          onClick={onRequestAnalysis}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Optimize with AI
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 animate-pulse text-violet-400" />
          <span className="text-sm text-slate-400">Analyzing route...</span>
        </div>
        {/* Skeleton cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/30 p-3"
          >
            <div className="mb-2 h-3 w-24 rounded bg-slate-700" />
            <div className="h-3 w-full rounded bg-slate-700/50" />
            <div className="mt-1 h-3 w-3/4 rounded bg-slate-700/50" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 mx-1">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-semibold text-white">AI Analysis</span>
        </div>
        <ScoreBar score={data.overallScore} />
        <p className="mt-2 text-xs text-slate-400">{data.summary}</p>
      </div>

      {/* Re-analyze button */}
      <div className="px-1">
        <button
          type="button"
          onClick={onRequestAnalysis}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
        >
          <Sparkles className="h-3 w-3" />
          Re-analyze
        </button>
      </div>

      {/* Suggestions */}
      <div className="px-1">
        <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Suggestions ({data.suggestions.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {data.suggestions.map((suggestion, i) => {
          const Icon = TYPE_ICONS[suggestion.type] || Zap;
          const priorityStyle =
            PRIORITY_STYLES[suggestion.priority] || PRIORITY_STYLES.medium;

          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                onSuggestionClick?.(suggestion.segmentFrom, suggestion.segmentTo)
              }
              className="flex w-full gap-2.5 border-b border-slate-800/50 px-3 py-2.5 text-left transition-colors hover:bg-slate-900"
            >
              <div className="mt-0.5 shrink-0">
                <Icon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">
                    WP {suggestion.segmentFrom} → {suggestion.segmentTo}
                  </span>
                  <span
                    className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${priorityStyle}`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                  {suggestion.description}
                </p>
                {suggestion.estimatedSavingsSeconds > 0 && (
                  <p className="mt-1 text-[10px] text-emerald-400">
                    Est. savings: {suggestion.estimatedSavingsSeconds.toFixed(1)}s per loop
                  </p>
                )}
              </div>
            </button>
          );
        })}

        {data.suggestions.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            No optimization suggestions. Your route looks efficient!
          </div>
        )}
      </div>
    </div>
  );
}
