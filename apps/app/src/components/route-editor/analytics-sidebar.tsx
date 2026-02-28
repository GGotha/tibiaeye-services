import type { RouteSegmentAnalytics } from "@/types";
import { useRouteSuggestions } from "@/hooks/use-route-analytics";
import { SegmentAnalytics } from "./segment-analytics";
import { AiSuggestions } from "./ai-suggestions";
import { useState } from "react";

type AnalyticsView = "segments" | "ai";

interface AnalyticsSidebarProps {
  routeId?: string;
  segmentData?: RouteSegmentAnalytics;
  onSegmentClick?: (fromIndex: number, toIndex: number) => void;
  selectedSegment?: { from: number; to: number } | null;
}

export function AnalyticsSidebar({
  routeId,
  segmentData,
  onSegmentClick,
  selectedSegment,
}: AnalyticsSidebarProps) {
  const [view, setView] = useState<AnalyticsView>("segments");
  const suggestions = useRouteSuggestions(routeId);

  if (!segmentData || segmentData.segments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-slate-400">
          No analytics data available yet.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Link this route to a session and run it a few times to collect timing data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b border-slate-800">
        <button
          type="button"
          onClick={() => setView("segments")}
          className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            view === "segments"
              ? "border-b border-emerald-500 text-emerald-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Segments
        </button>
        <button
          type="button"
          onClick={() => setView("ai")}
          className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            view === "ai"
              ? "border-b border-violet-500 text-violet-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          AI Optimize
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === "segments" ? (
          <SegmentAnalytics
            data={segmentData}
            onSegmentClick={onSegmentClick}
            selectedSegment={selectedSegment}
          />
        ) : (
          <AiSuggestions
            data={suggestions.data ?? null}
            isLoading={suggestions.isPending}
            onRequestAnalysis={() => suggestions.mutate()}
            onSuggestionClick={onSegmentClick}
          />
        )}
      </div>
    </div>
  );
}
