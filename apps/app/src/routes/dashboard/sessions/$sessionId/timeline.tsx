import { TimelineItem } from "@/components/timeline/timeline-item";
import { Button } from "@/components/ui/button";
import { useTimelineInfinite } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Kills", value: "kill" },
  { label: "Loot", value: "loot" },
  { label: "Deaths", value: "death" },
  { label: "Level Ups", value: "level_up" },
  { label: "Warnings", value: "warning" },
  { label: "Heals", value: "heal" },
  { label: "Connectivity", value: "connectivity" },
] as const;

const CONNECTIVITY_TYPES = new Set(["pause", "resume", "disconnect", "reconnect_retry", "reconnect_success", "reconnect_failure"]);

export const Route = createFileRoute("/dashboard/sessions/$sessionId/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const { sessionId } = Route.useParams();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTimelineInfinite(sessionId);
  const [filter, setFilter] = useState("all");

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "connectivity") return events.filter((e) => CONNECTIVITY_TYPES.has(e.type));
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/sessions/$sessionId" params={{ sessionId }}>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Timeline</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            className={cn(
              "border-slate-700 text-slate-400 hover:text-white",
              filter === option.value && "bg-slate-700 text-white border-slate-600"
            )}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-2">
          {filteredEvents.map((event, index) => (
            <TimelineItem key={`${event.type}-${event.timestamp}-${index}`} event={event} />
          ))}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-white"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          {filter === "all" ? "No events recorded in this session yet." : `No ${filter === "connectivity" ? "connectivity" : filter} events found.`}
        </div>
      )}
    </div>
  );
}
