import type { RouteSegmentAnalytics } from "@/types";
import { ArrowRight, Clock, TrendingUp, Zap } from "lucide-react";

interface SegmentAnalyticsProps {
  data: RouteSegmentAnalytics;
  onSegmentClick?: (fromIndex: number, toIndex: number) => void;
  selectedSegment?: { from: number; to: number } | null;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}m ${sec}s`;
}

function getStatusColor(isSlow: boolean, isHighVariance: boolean): string {
  if (isSlow) return "bg-red-500/20 text-red-400 border-red-500/30";
  if (isHighVariance) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
}

function getStatusLabel(isSlow: boolean, isHighVariance: boolean): string {
  if (isSlow) return "Slow";
  if (isHighVariance) return "Unstable";
  return "Good";
}

export function SegmentAnalytics({ data, onSegmentClick, selectedSegment }: SegmentAnalyticsProps) {
  const sorted = [...data.segments].sort((a, b) => b.avgSeconds - a.avgSeconds);

  return (
    <div className="flex flex-col gap-3">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 px-1">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <Clock className="h-3 w-3" />
            Avg Loop
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            {formatTime(data.totalAvgLoopSeconds)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <TrendingUp className="h-3 w-3" />
            Sessions
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            {data.sessionCount}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <Zap className="h-3 w-3" />
            Segments
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            {data.segments.length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <Clock className="h-3 w-3" />
            Avg Segment
          </div>
          <div className="mt-1 text-sm font-bold text-white">
            {formatTime(data.globalAvgSegmentSeconds)}
          </div>
        </div>
      </div>

      {/* Segment table */}
      <div className="px-1">
        <h3 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Segments (slowest first)
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.map((seg) => {
          const isSelected =
            selectedSegment?.from === seg.fromIndex &&
            selectedSegment?.to === seg.toIndex;

          return (
            <button
              key={`${seg.fromIndex}-${seg.toIndex}`}
              type="button"
              onClick={() => onSegmentClick?.(seg.fromIndex, seg.toIndex)}
              className={`flex w-full items-center gap-2 border-b border-slate-800/50 px-3 py-2 text-left transition-colors hover:bg-slate-900 ${
                isSelected ? "bg-slate-800/80" : ""
              }`}
            >
              {/* Segment index */}
              <div className="flex shrink-0 items-center gap-1 text-xs font-mono text-slate-400">
                <span className="w-5 text-right">{seg.fromIndex}</span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="w-5">{seg.toIndex}</span>
              </div>

              {/* Timing */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-white">
                  {formatTime(seg.avgSeconds)}
                </div>
                <div className="text-[10px] text-slate-500">
                  p95: {formatTime(seg.p95Seconds)} | {seg.sampleCount} runs
                </div>
              </div>

              {/* Status badge */}
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(
                  seg.isSlow,
                  seg.isHighVariance,
                )}`}
              >
                {getStatusLabel(seg.isSlow, seg.isHighVariance)}
              </span>
            </button>
          );
        })}

        {sorted.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No segment data yet. Run the route a few times to collect timing data.
          </div>
        )}
      </div>
    </div>
  );
}
