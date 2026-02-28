import type { RouteWaypoint } from "@/types";
import { useState } from "react";
import { WaypointMap } from "./waypoint-map";
import { WaypointSidebar } from "./waypoint-sidebar";

interface RouteEditorProps {
  waypoints: RouteWaypoint[];
  onWaypointsChange: (waypoints: RouteWaypoint[]) => void;
}

export function RouteEditor({ waypoints, onWaypointsChange }: RouteEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentFloor, setCurrentFloor] = useState(7);

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
        />
      </div>
      <WaypointSidebar
        waypoints={waypoints}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onUpdate={updateWaypoint}
        onDelete={deleteWaypoint}
        onMove={moveWaypoint}
      />
    </div>
  );
}
