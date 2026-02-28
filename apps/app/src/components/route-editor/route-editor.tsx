import type { RouteSegmentAnalytics, RouteWaypoint } from "@/types";
import { useState } from "react";
import { WaypointMap } from "./waypoint-map";
import { WaypointSidebar } from "./waypoint-sidebar";
import { AnalyticsSidebar } from "./analytics-sidebar";

type SidebarTab = "waypoints" | "analytics";

interface RouteEditorProps {
  waypoints: RouteWaypoint[];
  onWaypointsChange: (waypoints: RouteWaypoint[]) => void;
  routeId?: string;
  segmentData?: RouteSegmentAnalytics;
}

export function RouteEditor({ waypoints, onWaypointsChange, routeId, segmentData }: RouteEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentFloor, setCurrentFloor] = useState(7);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("waypoints");
  const [highlightedSegment, setHighlightedSegment] = useState<{ from: number; to: number } | null>(null);

  const addWaypoint = (x: number, y: number) => {
    const newWaypoint: RouteWaypoint = {
      id: waypoints.length,
      type: "walk",
      coordinate: [x, y, currentFloor],
      label: "",
      options: {},
    };
    onWaypointsChange([...waypoints, newWaypoint]);
    setSelectedIndex(waypoints.length);
  };

  const updateWaypoint = (index: number, updates: Partial<RouteWaypoint>) => {
    const updated = waypoints.map((wp, i) =>
      i === index ? { ...wp, ...updates } : wp
    );
    onWaypointsChange(updated);
  };

  const deleteWaypoint = (index: number) => {
    const updated = waypoints
      .filter((_, i) => i !== index)
      .map((wp, i) => ({ ...wp, id: i }));
    onWaypointsChange(updated);
    if (selectedIndex === index) setSelectedIndex(null);
    else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const moveWaypoint = (from: number, to: number) => {
    const updated = [...waypoints];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    const reindexed = updated.map((wp, i) => ({ ...wp, id: i }));
    onWaypointsChange(reindexed);
    if (selectedIndex === from) setSelectedIndex(to);
  };

  const handleSegmentClick = (fromIndex: number, toIndex: number) => {
    setHighlightedSegment({ from: fromIndex, to: toIndex });
    // Pan to the segment start waypoint
    setSelectedIndex(fromIndex);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1">
        <WaypointMap
          waypoints={waypoints}
          selectedIndex={selectedIndex}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          onMapClick={addWaypoint}
          onSelectWaypoint={setSelectedIndex}
          onMoveWaypoint={(index, x, y) =>
            updateWaypoint(index, { coordinate: [x, y, waypoints[index].coordinate?.[2] ?? currentFloor] })
          }
          segmentData={segmentData}
          highlightedSegment={highlightedSegment}
        />
      </div>

      {/* Sidebar with tab toggle */}
      <div className="flex w-80 flex-col border-l border-slate-800 bg-slate-950">
        {/* Tab toggle header */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setSidebarTab("waypoints")}
            className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
              sidebarTab === "waypoints"
                ? "border-b-2 border-emerald-500 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Waypoints ({waypoints.length})
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("analytics")}
            className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
              sidebarTab === "analytics"
                ? "border-b-2 border-violet-500 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Tab content */}
        {sidebarTab === "waypoints" ? (
          <WaypointSidebar
            waypoints={waypoints}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onUpdate={updateWaypoint}
            onDelete={deleteWaypoint}
            onMove={moveWaypoint}
          />
        ) : (
          <AnalyticsSidebar
            routeId={routeId}
            segmentData={segmentData}
            onSegmentClick={handleSegmentClick}
            selectedSegment={highlightedSegment}
          />
        )}
      </div>
    </div>
  );
}
