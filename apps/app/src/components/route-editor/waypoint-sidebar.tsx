import type { RouteWaypoint } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";

const WAYPOINT_TYPES = [
  "walk",
  "moveUp",
  "moveDown",
  "useRope",
  "useShovel",
  "useHole",
  "useLadder",
  "useTeleport",
  "label",
  "stand",
  "useHotkey",
  "refillChecker",
  "depositGold",
  "refill",
  "refillPotions",
  "depositItems",
  "dropFlasks",
] as const;

const WAYPOINT_COLORS: Record<string, string> = {
  walk: "#10b981",
  moveUp: "#60a5fa",
  moveDown: "#f59e0b",
  useRope: "#8b5cf6",
  useShovel: "#a16207",
  useHole: "#a16207",
  useLadder: "#06b6d4",
  useTeleport: "#ec4899",
  label: "#94a3b8",
  stand: "#6b7280",
  useHotkey: "#f97316",
  refillChecker: "#ef4444",
  depositGold: "#eab308",
  refill: "#f97316",
  refillPotions: "#f97316",
  depositItems: "#6366f1",
  dropFlasks: "#a855f7",
};

const WAYPOINT_ICONS: Record<string, string> = {
  walk: "\u25cf",
  moveUp: "\u2191",
  moveDown: "\u2193",
  useRope: "\u2b06",
  useShovel: "\u26cf",
  useHole: "\u25bc",
  useLadder: "\u2630",
  useTeleport: "\u2728",
  label: "\ud83c\udff7",
  stand: "\u23f8",
  useHotkey: "\u2328",
  refillChecker: "!",
  depositGold: "$",
  refill: "\u2697",
  refillPotions: "\u2697",
  depositItems: "\ud83d\udce6",
  dropFlasks: "\ud83d\uddd1",
};

const TYPE_LABELS: Record<string, string> = {
  walk: "Walk",
  moveUp: "Move Up",
  moveDown: "Move Down",
  useRope: "Use Rope",
  useShovel: "Use Shovel",
  useHole: "Use Hole",
  useLadder: "Use Ladder",
  useTeleport: "Use Teleport",
  label: "Label",
  stand: "Stand",
  useHotkey: "Use Hotkey",
  refillChecker: "Refill Checker",
  depositGold: "Deposit Gold",
  refill: "Refill",
  refillPotions: "Refill Potions",
  depositItems: "Deposit Items",
  dropFlasks: "Drop Flasks",
};

interface WaypointSidebarProps {
  waypoints: RouteWaypoint[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onUpdate: (index: number, updates: Partial<RouteWaypoint>) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

export function WaypointSidebar({
  waypoints,
  selectedIndex,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
}: WaypointSidebarProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      onMove(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const selected = selectedIndex !== null ? waypoints[selectedIndex] : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Waypoint list */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {waypoints.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Click on the map to add waypoints
          </div>
        ) : (
          waypoints.map((wp, index) => {
            const color = WAYPOINT_COLORS[wp.type] || "#10b981";
            const icon = WAYPOINT_ICONS[wp.type] || "\u25cf";
            const isSelected = index === selectedIndex;
            const isDragOver = index === dragOverIndex && dragIndex !== index;

            return (
              <div
                key={wp.id}
                draggable
                onClick={() => onSelect(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelect(index);
                }}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex cursor-pointer items-center gap-2 border-b border-slate-800/50 px-3 py-2 transition-colors ${
                  isSelected
                    ? "bg-slate-800/80"
                    : "hover:bg-slate-900"
                } ${isDragOver ? "border-t-2 border-t-emerald-500" : ""} ${
                  dragIndex === index ? "opacity-40" : ""
                }`}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-slate-600" />

                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs" title={wp.type}>
                      {icon}
                    </span>
                    <span className="truncate text-xs font-medium text-slate-300">
                      {TYPE_LABELS[wp.type] || wp.type}
                    </span>
                  </div>
                  {wp.coordinate && (
                    <div className="text-[10px] text-slate-500">
                      {wp.coordinate[0]}, {wp.coordinate[1]}, {wp.coordinate[2]}
                    </div>
                  )}
                  {wp.label && (
                    <div className="truncate text-[10px] text-emerald-400">
                      {wp.label}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) onMove(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < waypoints.length - 1) onMove(index, index + 1);
                    }}
                    disabled={index === waypoints.length - 1}
                    className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                    }}
                    className="rounded p-0.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Waypoint editor panel */}
      {selected && selectedIndex !== null && (
        <WaypointEditor
          waypoint={selected}
          onUpdate={(updates) => onUpdate(selectedIndex, updates)}
        />
      )}
    </div>
  );
}

interface WaypointEditorProps {
  waypoint: RouteWaypoint;
  onUpdate: (updates: Partial<RouteWaypoint>) => void;
}

function WaypointEditor({ waypoint, onUpdate }: WaypointEditorProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-t border-slate-700 bg-slate-900/80">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        Edit Waypoint
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          {/* Type */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Type
            </label>
            <select
              value={waypoint.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {WAYPOINT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {WAYPOINT_ICONS[type]} {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Coordinate */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Coordinate
            </label>
            <div className="flex gap-1.5">
              {(["X", "Y", "Z"] as const).map((axis, i) => (
                <div key={axis} className="flex-1">
                  <label className="mb-0.5 block text-[9px] text-slate-600">
                    {axis}
                  </label>
                  <input
                    type="number"
                    value={waypoint.coordinate?.[i] ?? 0}
                    onChange={(e) => {
                      const coord = [...(waypoint.coordinate || [0, 0, 7])] as [
                        number,
                        number,
                        number,
                      ];
                      coord[i] = Number(e.target.value);
                      onUpdate({ coordinate: coord });
                    }}
                    className="w-full rounded bg-slate-800 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Label
            </label>
            <input
              type="text"
              value={waypoint.label || ""}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Optional label..."
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Type-specific options */}
          <WaypointOptions
            type={waypoint.type}
            options={waypoint.options || {}}
            onUpdate={(options) => onUpdate({ options })}
          />
        </div>
      )}
    </div>
  );
}

interface WaypointOptionsProps {
  type: string;
  options: Record<string, unknown>;
  onUpdate: (options: Record<string, unknown>) => void;
}

function WaypointOptions({ type, options, onUpdate }: WaypointOptionsProps) {
  const set = (key: string, value: unknown) => {
    onUpdate({ ...options, [key]: value });
  };

  switch (type) {
    case "useRope":
    case "useShovel":
    case "useHotkey":
      return (
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Hotkey
          </label>
          <input
            type="text"
            value={(options.hotkey as string) || ""}
            onChange={(e) => set("hotkey", e.target.value)}
            placeholder="e.g. o"
            maxLength={5}
            className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      );

    case "moveUp":
    case "moveDown":
      return (
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Direction
          </label>
          <select
            value={(options.direction as string) || ""}
            onChange={(e) => set("direction", e.target.value)}
            className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Auto</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
        </div>
      );

    case "refillChecker":
      return (
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Min Health Potions
            </label>
            <input
              type="number"
              value={(options.minimumAmountOfHealthPotions as number) ?? 0}
              onChange={(e) =>
                set("minimumAmountOfHealthPotions", Number(e.target.value))
              }
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Min Mana Potions
            </label>
            <input
              type="number"
              value={(options.minimumAmountOfManaPotions as number) ?? 0}
              onChange={(e) =>
                set("minimumAmountOfManaPotions", Number(e.target.value))
              }
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Min Cap
            </label>
            <input
              type="number"
              value={(options.minimumAmountOfCap as number) ?? 0}
              onChange={(e) =>
                set("minimumAmountOfCap", Number(e.target.value))
              }
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Redirect Label
            </label>
            <input
              type="text"
              value={(options.waypointLabelToRedirect as string) || ""}
              onChange={(e) =>
                set("waypointLabelToRedirect", e.target.value)
              }
              placeholder="Label to redirect to"
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none placeholder:text-slate-600 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      );

    case "stand":
      return (
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Duration (ms)
          </label>
          <input
            type="number"
            value={(options.duration as number) ?? 1000}
            onChange={(e) => set("duration", Number(e.target.value))}
            className="w-full rounded bg-slate-800 px-2 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      );

    default:
      return null;
  }
}
