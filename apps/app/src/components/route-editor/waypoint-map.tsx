import type { RouteWaypoint } from "@/types";
import L from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const TILE_URL_PREFIX = "https://tibiamaps.github.io/tibia-map-data/mapper/Minimap_Color_";
const DEFAULT_ZOOM = 2;

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

function createCustomCRS(): L.CRS {
  return L.Util.extend({}, L.CRS.Simple, {
    scale(zoom: number) {
      switch (zoom) {
        case 0: return 256;
        case 1: return 512;
        case 2: return 1792;
        case 3: return 5120;
        case 4: return 10240;
        default: return 256;
      }
    },
    latLngToPoint(latlng: L.LatLng, zoom: number) {
      const projectedPoint = this.projection.project(latlng);
      const s = this.scale(zoom);
      return this.transformation._transform(projectedPoint, s);
    },
    pointToLatLng(point: L.Point, zoom: number) {
      const s = this.scale(zoom);
      const untransformedPoint = this.transformation.untransform(point, s);
      return this.projection.unproject(untransformedPoint);
    },
  } as L.CRS);
}

function createTileLayer(floor: number): L.GridLayer {
  const layer = new L.GridLayer({ floor } as L.GridLayerOptions);

  layer.getTileSize = function (this: L.GridLayer) {
    const tileSize = L.GridLayer.prototype.getTileSize.call(this);
    const zoom = (this as unknown as { _tileZoom: number })._tileZoom;
    if (zoom > 0) {
      return tileSize.divideBy(this._map.getZoomScale(0, zoom)).round();
    }
    return tileSize;
  };

  layer.createTile = function (this: L.GridLayer, coords: L.Coords, done: L.DoneCallback) {
    const tile = document.createElement("canvas");
    const ctx = tile.getContext("2d")!;
    tile.width = 256;
    tile.height = 256;

    const latlng = this._map.project({ lng: coords.x, lat: coords.y } as L.LatLngLiteral, 0);
    const absX = Math.abs(latlng.x);
    const absY = Math.abs(latlng.y);
    const tileId = `${absX}_${absY}_${floor}`;

    ctx.imageSmoothingEnabled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => { ctx.drawImage(image, 0, 0, 256, 256); done(undefined, tile); };
    image.onerror = () => { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 256, 256); done(undefined, tile); };
    image.src = `${TILE_URL_PREFIX}${tileId}.png`;

    return tile;
  };

  return layer;
}

function tibiaToLatLng(map: L.Map, x: number, y: number): L.LatLng {
  const point = L.point(x, y);
  return map.unproject(point, 0);
}

function latLngToTibia(map: L.Map, latlng: L.LatLng): [number, number] {
  const point = map.project(latlng, 0);
  return [Math.round(point.x), Math.round(point.y)];
}

function createWaypointIcon(index: number, type: string, isSelected: boolean): L.DivIcon {
  const color = WAYPOINT_COLORS[type] || "#10b981";
  const border = isSelected ? "3px solid #fff" : "2px solid rgba(0,0,0,0.5)";
  const size = isSelected ? 28 : 24;

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:${border};
      display:flex;align-items:center;justify-content:center;
      font-size:10px;color:#fff;font-weight:bold;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      cursor:grab;
    ">${index + 1}</div>`,
  });
}

interface WaypointMapProps {
  waypoints: RouteWaypoint[];
  selectedIndex: number | null;
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  onMapClick: (x: number, y: number) => void;
  onSelectWaypoint: (index: number) => void;
  onMoveWaypoint: (index: number, x: number, y: number) => void;
}

export function WaypointMap({
  waypoints,
  selectedIndex,
  currentFloor,
  onFloorChange,
  onMapClick,
  onSelectWaypoint,
  onMoveWaypoint,
}: WaypointMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.GridLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Keep latest onMapClick in a ref so the Leaflet click handler always uses the current callback
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => { onMapClickRef.current = onMapClick; }, [onMapClick]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const crs = createCustomCRS();
    const map = L.map(containerRef.current, {
      crs,
      center: [0, 0],
      zoom: DEFAULT_ZOOM,
      minZoom: 0,
      maxZoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    const tileLayer = createTileLayer(currentFloor);
    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Center on Tibia mainland
    const center = tibiaToLatLng(map, 32500, 32000);
    map.setView(center, DEFAULT_ZOOM);

    map.on("click", (e: L.LeafletMouseEvent) => {
      const [x, y] = latLngToTibia(map, e.latlng);
      onMapClickRef.current(x, y);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update tile layer on floor change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const newLayer = createTileLayer(currentFloor);
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [currentFloor]);

  // Update markers and polyline
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    for (const m of markersRef.current) {
      map.removeLayer(m);
    }
    markersRef.current = [];

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Filter waypoints on current floor
    const floorWaypoints = waypoints
      .map((wp, i) => ({ wp, originalIndex: i }))
      .filter(({ wp }) => wp.coordinate && wp.coordinate[2] === currentFloor);

    // Add markers
    const polylinePoints: L.LatLng[] = [];

    for (const { wp, originalIndex } of floorWaypoints) {
      if (!wp.coordinate) continue;

      const latlng = tibiaToLatLng(map, wp.coordinate[0], wp.coordinate[1]);
      polylinePoints.push(latlng);

      const icon = createWaypointIcon(originalIndex, wp.type, originalIndex === selectedIndex);
      const marker = L.marker(latlng, {
        icon,
        draggable: true,
        zIndexOffset: originalIndex === selectedIndex ? 1000 : 0,
      });

      marker.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        onSelectWaypoint(originalIndex);
      });

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const [newX, newY] = latLngToTibia(map, pos);
        onMoveWaypoint(originalIndex, newX, newY);
      });

      if (wp.label) {
        marker.bindTooltip(wp.label, {
          permanent: false,
          direction: "top",
          offset: [0, -14],
          className: "bg-slate-900 text-white border-slate-700 text-xs px-2 py-1 rounded",
        });
      }

      marker.addTo(map);
      markersRef.current.push(marker);
    }

    // Draw polyline connecting waypoints
    if (polylinePoints.length > 1) {
      polylineRef.current = L.polyline(polylinePoints, {
        color: "#10b981",
        weight: 2,
        opacity: 0.6,
        dashArray: "5, 8",
      }).addTo(map);
    }
  }, [waypoints, selectedIndex, currentFloor, onSelectWaypoint, onMoveWaypoint]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Pan to selected waypoint (only when selection changes, not on floor change)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedIndex === null) return;

    const wp = waypoints[selectedIndex];
    if (!wp?.coordinate) return;

    if (wp.coordinate[2] !== currentFloor) {
      onFloorChange(wp.coordinate[2]);
    }

    const latlng = tibiaToLatLng(map, wp.coordinate[0], wp.coordinate[1]);
    map.panTo(latlng, { animate: true, duration: 0.3 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const floorLabel = currentFloor === 7 ? "Ground" : currentFloor < 7 ? `+${7 - currentFloor}` : `-${currentFloor - 7}`;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Floor selector */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/90 p-2 backdrop-blur-sm">
        <label className="mb-1 block text-xs text-slate-400">Floor</label>
        <select
          value={currentFloor}
          onChange={(e) => onFloorChange(Number(e.target.value))}
          className="rounded bg-slate-800 px-2 py-1 text-sm text-white outline-none"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <option key={i} value={i}>
              {i} {i === 7 ? "(Ground)" : i < 7 ? `(+${7 - i})` : `(-${i - 7})`}
            </option>
          ))}
        </select>
      </div>

      {/* Waypoint count badge */}
      <div className="absolute top-4 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-sm text-slate-300 backdrop-blur-sm">
        {waypoints.filter((w) => w.coordinate?.[2] === currentFloor).length} waypoints on floor {floorLabel}
      </div>

      {/* Click hint */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-400 backdrop-blur-sm">
        Click map to add waypoint
      </div>
    </div>
  );
}
