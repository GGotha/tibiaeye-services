import { RouteEditor } from "@/components/route-editor/route-editor";
import { useRoute, useUpdateRoute } from "@/hooks/use-routes";
import { useRouteSegments } from "@/hooks/use-route-analytics";
import { api } from "@/lib/api";
import type { RouteWaypoint } from "@/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Download, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/dashboard/routes/$routeId")({
  component: RouteEditorPage,
});

function RouteEditorPage() {
  const { routeId } = Route.useParams();
  const { data: route, isLoading } = useRoute(routeId);
  const updateRoute = useUpdateRoute();
  const navigate = useNavigate();
  const { data: segmentData } = useRouteSegments(routeId);

  const [name, setName] = useState("");
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (route && !initializedRef.current) {
      setName(route.name);
      setWaypoints(route.waypoints);
      initializedRef.current = true;
    }
  }, [route]);

  const handleWaypointsChange = useCallback((newWaypoints: RouteWaypoint[]) => {
    setWaypoints(newWaypoints);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    await updateRoute.mutateAsync({ id: routeId, name, waypoints });
    setHasChanges(false);
  };

  const handleExport = async () => {
    const data = await api.exportRoute(routeId);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading route...</div>;
  }

  if (!route) {
    return <div className="text-red-400">Route not found</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard/routes" })}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
            className="bg-transparent text-lg font-bold text-white outline-none border-b border-transparent focus:border-emerald-500 transition-colors"
          />
          {hasChanges && <span className="text-xs text-amber-400">unsaved</span>}
        </div>
        <div className="flex items-center gap-2">
          {segmentData && segmentData.segments.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              <BarChart3 className="h-3.5 w-3.5" />
              {segmentData.sessionCount} sessions analyzed
            </div>
          )}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || updateRoute.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {updateRoute.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <RouteEditor
        waypoints={waypoints}
        onWaypointsChange={handleWaypointsChange}
        routeId={routeId}
        segmentData={segmentData}
      />
    </div>
  );
}
