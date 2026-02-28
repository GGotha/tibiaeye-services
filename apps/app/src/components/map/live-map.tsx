import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import { Crosshair } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface KillsHeatmapPoint {
  x: number;
  y: number;
  z: number;
  kills: number;
  totalExperience: number;
}

interface PositionLog {
  x: number;
  y: number;
  z: number;
  recordedAt: string;
}

interface PositionHeatmapPoint {
  x: number;
  y: number;
  z: number;
  visits: number;
}

interface LiveMapProps {
  position: Position | null;
  isConnected: boolean;
  heatmapData?: KillsHeatmapPoint[];
  pathData?: PositionLog[];
  visitHeatmapData?: PositionHeatmapPoint[];
  compact?: boolean;
  heatmapTimeRange?: number | null;
  onHeatmapTimeRangeChange?: (range: number | null) => void;
}

const TILE_URL_PREFIX = "https://tibiamaps.github.io/tibia-map-data/mapper/Minimap_Color_";
const BOUNDS = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };

const MAX_TRAIL_LENGTH = 50;
const DEFAULT_ZOOM = 2;
const MAX_USEFUL_ZOOM = 4;

const HEATMAP_TIME_RANGES = [
  { label: "All", value: null },
  { label: "5m", value: 5 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
] as const;

const STYLE_ID = "livemap-pulse-keyframes";

const REPLAY_SPEEDS = [1, 2, 5, 10] as const;
const REPLAY_INTERVAL_MS = 200;

// Custom CRS matching tibiamaps.io — Tibia coordinates map directly to Leaflet
function createCustomCRS(): L.CRS {
  return L.Util.extend({}, L.CRS.Simple, {
    scale(zoom: number) {
      switch (zoom) {
        case 0:
          return 256;
        case 1:
          return 512;
        case 2:
          return 1792;
        case 3:
          return 5120;
        case 4:
          return 10240;
        default:
          return 256;
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
    image.onload = () => {
      ctx.drawImage(image, 0, 0, 256, 256);
      done(undefined, tile);
    };
    image.onerror = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 256, 256);
      done(undefined, tile);
    };
    image.src = `${TILE_URL_PREFIX}${tileId}.png`;

    return tile;
  };

  return layer;
}

function createCharacterIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="position:absolute;inset:0;border-radius:50%;border:2px solid #10b981;animation:livemap-pulse 2s ease-out infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#10b981;box-shadow:0 0 8px 2px rgba(16,185,129,0.6);"></div>
      </div>
    `,
  });
}


function tibiaToLatLng(map: L.Map, x: number, y: number): L.LatLng {
  return map.unproject([x, y], 0);
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const LiveMap = memo(function LiveMap({
  position,
  isConnected,
  heatmapData,
  pathData,
  visitHeatmapData,
  compact,
  heatmapTimeRange,
  onHeatmapTimeRangeChange,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.GridLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const trailPointsRef = useRef<L.LatLng[]>([]);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const visitHeatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const replayTrailRef = useRef<L.Polyline | null>(null);
  const replayMarkerRef = useRef<L.Marker | null>(null);
  const [currentFloor, setCurrentFloor] = useState(7);
  const [floorOverride, setFloorOverride] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVisitHeatmap, setShowVisitHeatmap] = useState(false);
  const hasZoomedRef = useRef(false);

  // Replay state
  const [replayIndex, setReplayIndex] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<(typeof REPLAY_SPEEDS)[number]>(1);

  const isReplayMode = !!pathData && pathData.length > 0 && !position;

  // Inject CSS keyframes for pulsing animation
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @keyframes livemap-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(STYLE_ID);
      if (el) el.remove();
    };
  }, []);

  // Initialize map with custom CRS and tile layer
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const crs = createCustomCRS();

    const xPadding = 2;
    const yPadding = 2;
    const maxBounds = L.latLngBounds(
      L.latLng(-(BOUNDS.yMin - yPadding), BOUNDS.xMin - xPadding),
      L.latLng(-(BOUNDS.yMax + 1 + yPadding), BOUNDS.xMax + 1 + xPadding)
    );

    const map = L.map(mapContainerRef.current, {
      crs,
      attributionControl: false,
      fadeAnimation: false,
      maxBounds,
      maxNativeZoom: 0,
      maxZoom: 4,
      minZoom: 0,
      zoom: 0,
      center: L.latLng(-125, 129),
    });

    const layer = createTileLayer(7);
    layer.addTo(map);
    tileLayerRef.current = layer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
      trailRef.current = null;
      trailPointsRef.current = [];
      hasZoomedRef.current = false;
    };
  }, []);

  // Switch tile layer when floor changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const layer = createTileLayer(currentFloor);
    layer.addTo(map);
    tileLayerRef.current = layer;
  }, [currentFloor]);

  // Update marker, trail, and camera when position changes (live mode)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    const latLng = tibiaToLatLng(map, position.x, position.y);

    // Auto-switch floor only when not manually overridden
    if (!floorOverride && position.z !== currentFloor) {
      setCurrentFloor(position.z);
    }

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.marker(latLng, {
        icon: createCharacterIcon(),
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // Update trail
    trailPointsRef.current = [...trailPointsRef.current, latLng].slice(-MAX_TRAIL_LENGTH);
    if (trailRef.current) {
      trailRef.current.setLatLngs(trailPointsRef.current);
    } else {
      trailRef.current = L.polyline(trailPointsRef.current, {
        color: "#10b981",
        weight: 2,
        opacity: 0.4,
        dashArray: "4 6",
      }).addTo(map);
    }

    // Camera follow (only when not on a different floor)
    if (autoFollow && !floorOverride) {
      if (!hasZoomedRef.current) {
        map.flyTo(latLng, DEFAULT_ZOOM, { animate: true, duration: 0.8 });
        hasZoomedRef.current = true;
      } else {
        map.panTo(latLng, { animate: true, duration: 0.3 });
      }
    }
  }, [position, currentFloor, autoFollow, floorOverride]);

  // Enter replay mode: clean up live markers and set initial view
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run on mode/data change, not floor
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReplayMode) return;

    // Remove live mode markers
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (trailRef.current) {
      map.removeLayer(trailRef.current);
      trailRef.current = null;
      trailPointsRef.current = [];
    }

    // Initial view — jump to first point without animation (avoids heavy repaint)
    if (!hasZoomedRef.current && pathData.length > 0) {
      const first = pathData[0];
      setCurrentFloor(first.z);
      const firstLatLng = tibiaToLatLng(map, first.x, first.y);
      const currentZoom = map.getZoom();
      const zoom = currentZoom > 0 ? currentZoom : DEFAULT_ZOOM;
      map.setView(firstLatLng, zoom, { animate: false });
      hasZoomedRef.current = true;
    }

    return () => {
      if (replayTrailRef.current && map) {
        map.removeLayer(replayTrailRef.current);
        replayTrailRef.current = null;
      }
    };
  }, [isReplayMode, pathData]);

  // Update replay trail polyline and marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReplayMode || !pathData?.length) return;

    // Deduplicate consecutive same-position points for performance
    const floorPoints = pathData.filter((p) => p.z === currentFloor);
    const simplified: L.LatLng[] = [];
    let prevX = -1;
    let prevY = -1;
    for (const p of floorPoints) {
      if (p.x === prevX && p.y === prevY) continue;
      simplified.push(tibiaToLatLng(map, p.x, p.y));
      prevX = p.x;
      prevY = p.y;
    }

    if (replayTrailRef.current) {
      replayTrailRef.current.setLatLngs(simplified);
    } else {
      replayTrailRef.current = L.polyline(simplified, {
        color: "#10b981",
        weight: 2,
        opacity: 0.3,
        smoothFactor: 2,
      }).addTo(map);
    }

    // Place marker at current replay position
    const point = pathData[replayIndex];
    if (point) {
      if (point.z !== currentFloor) {
        setCurrentFloor(point.z);
      }

      const latLng = tibiaToLatLng(map, point.x, point.y);

      if (replayMarkerRef.current) {
        replayMarkerRef.current.setLatLng(latLng);
      } else {
        replayMarkerRef.current = L.marker(latLng, {
          icon: createCharacterIcon(),
          zIndexOffset: 1000,
        }).addTo(map);
      }

      if (autoFollow) {
        map.panTo(latLng, { animate: true, duration: 0.3 });
      }
    }
  }, [replayIndex, isReplayMode, pathData, autoFollow, currentFloor]);

  // Cleanup replay marker when leaving replay mode
  useEffect(() => {
    if (isReplayMode) return;
    const map = mapRef.current;
    if (!map) return;

    if (replayMarkerRef.current) {
      map.removeLayer(replayMarkerRef.current);
      replayMarkerRef.current = null;
    }
  }, [isReplayMode]);

  // Replay auto-advance timer
  useEffect(() => {
    if (!replayPlaying || !isReplayMode) return;

    const interval = setInterval(() => {
      setReplayIndex((prev) => {
        const next = prev + replaySpeed;
        if (next >= pathData.length) {
          setReplayPlaying(false);
          return pathData.length - 1;
        }
        return next;
      });
    }, REPLAY_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [replayPlaying, replaySpeed, isReplayMode, pathData]);

  // Render kills heatmap layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (!showHeatmap || !heatmapData || heatmapData.length === 0) return;

    const group = L.layerGroup();
    const floorData = heatmapData.filter((p) => p.z === currentFloor);
    const maxKills = Math.max(...floorData.map((p) => p.kills), 1);

    for (const point of floorData) {
      const latLng = tibiaToLatLng(map, point.x, point.y);
      const intensity = point.kills / maxKills;
      const radius = Math.min(3 + point.kills, 12);

      L.circleMarker(latLng, {
        radius,
        color: "transparent",
        fillColor: `rgb(${Math.round(200 + 55 * intensity)}, ${Math.round(60 * (1 - intensity))}, ${Math.round(60 * (1 - intensity))})`,
        fillOpacity: 0.3 + 0.5 * intensity,
      })
        .bindTooltip(`${point.kills} kills (${point.totalExperience.toLocaleString()} XP)`, {
          className: "bg-slate-900 text-white border-slate-700",
        })
        .addTo(group);
    }

    group.addTo(map);
    heatmapLayerRef.current = group;
  }, [heatmapData, showHeatmap, currentFloor]);

  // Render visit heatmap layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (visitHeatmapLayerRef.current) {
      map.removeLayer(visitHeatmapLayerRef.current);
      visitHeatmapLayerRef.current = null;
    }

    if (!showVisitHeatmap || !visitHeatmapData || visitHeatmapData.length === 0) return;

    const group = L.layerGroup();
    const floorData = visitHeatmapData.filter((p) => p.z === currentFloor);
    const maxVisits = Math.max(...floorData.map((p) => p.visits), 1);

    for (const point of floorData) {
      const latLng = tibiaToLatLng(map, point.x, point.y);
      const intensity = point.visits / maxVisits;
      const radius = Math.min(3 + Math.log2(point.visits), 12);

      L.circleMarker(latLng, {
        radius,
        color: "transparent",
        fillColor: `rgb(${Math.round(100 + 55 * intensity)}, ${Math.round(80 * (1 - intensity))}, ${Math.round(180 + 75 * intensity)})`,
        fillOpacity: 0.2 + 0.6 * intensity,
      })
        .bindTooltip(`${point.visits} visits`, {
          className: "bg-slate-900 text-white border-slate-700",
        })
        .addTo(group);
    }

    group.addTo(map);
    visitHeatmapLayerRef.current = group;
  }, [visitHeatmapData, showVisitHeatmap, currentFloor]);

  const toggleAutoFollow = useCallback(() => {
    setAutoFollow((prev) => !prev);
  }, []);

  const backToPosition = useCallback(() => {
    if (!position || !mapRef.current) return;
    setFloorOverride(false);
    setCurrentFloor(position.z);
    setAutoFollow(true);
    const latLng = tibiaToLatLng(mapRef.current, position.x, position.y);
    mapRef.current.flyTo(latLng, mapRef.current.getZoom(), { animate: true, duration: 0.5 });
  }, [position]);

  const zoomToCharacter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (position) {
      setFloorOverride(false);
      setCurrentFloor(position.z);
      setAutoFollow(true);
      const latLng = tibiaToLatLng(map, position.x, position.y);
      map.flyTo(latLng, MAX_USEFUL_ZOOM, { animate: true, duration: 0.8 });
      return;
    }

    if (isReplayMode && pathData && pathData.length > 0) {
      const point = pathData[replayIndex];
      if (!point) return;
      setCurrentFloor(point.z);
      setAutoFollow(true);
      const latLng = tibiaToLatLng(map, point.x, point.y);
      map.flyTo(latLng, MAX_USEFUL_ZOOM, { animate: true, duration: 0.8 });
    }
  }, [position, isReplayMode, pathData, replayIndex]);

  const hasKillsHeatmap = showHeatmap && heatmapData && heatmapData.length > 0;
  const hasVisitHeatmap = showVisitHeatmap && visitHeatmapData && visitHeatmapData.length > 0;
  const isHeatmapActive = hasKillsHeatmap || hasVisitHeatmap;

  const mapHeight = compact ? "h-[300px]" : "h-[500px]";

  const currentReplayPoint = isReplayMode && pathData.length > 0 ? pathData[replayIndex] : null;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className={compact ? "pb-1 pt-3 px-4" : "pb-2"}>
        <div className="flex items-center justify-between">
          <CardTitle className={compact ? "text-white text-base" : "text-white"}>
            {isReplayMode ? "Path Replay" : "Live Position"}
          </CardTitle>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAutoFollow}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                autoFollow
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {autoFollow ? "Following" : "Free camera"}
            </button>
            {(position || isReplayMode) && (
              <button
                type="button"
                onClick={zoomToCharacter}
                className="p-1.5 rounded text-xs font-medium transition-colors bg-slate-800 text-slate-400 border border-slate-700 hover:text-emerald-400 hover:border-emerald-500/30"
                title="Zoom to character"
              >
                <Crosshair className="h-3.5 w-3.5" />
              </button>
            )}
            {heatmapData && heatmapData.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHeatmap((prev) => !prev)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  showHeatmap
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                Kills
              </button>
            )}
            {visitHeatmapData && visitHeatmapData.length > 0 && (
              <button
                type="button"
                onClick={() => setShowVisitHeatmap((prev) => !prev)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  showVisitHeatmap
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                Visits
              </button>
            )}
            {!compact && (
              <select
                value={currentFloor}
                onChange={(e) => {
                  const newFloor = Number(e.target.value);
                  setCurrentFloor(newFloor);
                  if (position && newFloor !== position.z) {
                    setFloorOverride(true);
                  } else {
                    setFloorOverride(false);
                  }
                }}
                className="bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
              >
                {Array.from({ length: 16 }, (_, i) => i).map((floorNum) => (
                  <option key={`floor-${floorNum}`} value={floorNum}>
                    Floor {floorNum}{" "}
                    {floorNum === 7 ? "(ground)" : floorNum < 7 ? "(sky)" : "(underground)"}
                  </option>
                ))}
              </select>
            )}
            {!isReplayMode && floorOverride && position && (
              <button
                type="button"
                onClick={backToPosition}
                className="px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
              >
                Back to position
              </button>
            )}
            {!isReplayMode && (
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
                />
                {!compact && (
                  <span className="text-sm text-slate-400">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-4 pt-1" : undefined}>
        {isHeatmapActive && onHeatmapTimeRangeChange && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-slate-500">Period:</span>
            {HEATMAP_TIME_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => onHeatmapTimeRangeChange(range.value)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  heatmapTimeRange === range.value
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative">
          <div
            ref={mapContainerRef}
            className={`w-full ${mapHeight} rounded-lg overflow-hidden`}
            style={{ background: "#0f172a" }}
          />
          {/* Live position coordinate overlay */}
          {position && !isReplayMode && (
            <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 border border-slate-700 rounded-md px-3 py-1.5">
              <span className="text-xs font-mono text-emerald-400">
                {position.x}, {position.y}, {position.z}
              </span>
            </div>
          )}
          {/* Replay coordinate overlay */}
          {currentReplayPoint && (
            <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 border border-slate-700 rounded-md px-3 py-1.5">
              <span className="text-xs font-mono text-blue-400">
                {currentReplayPoint.x}, {currentReplayPoint.y}, {currentReplayPoint.z}
              </span>
            </div>
          )}
          {/* Waiting message for live mode */}
          {!position && !isReplayMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
              <span className="text-slate-500">Waiting for position data...</span>
            </div>
          )}
          {/* Replay controls */}
          {isReplayMode && (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/95 border border-slate-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReplayPlaying((prev) => !prev)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  {replayPlaying ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <rect x="1" y="1" width="3.5" height="10" rx="0.5" />
                      <rect x="7.5" y="1" width="3.5" height="10" rx="0.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M2 1l9 5-9 5V1z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={pathData.length - 1}
                  value={replayIndex}
                  onChange={(e) => {
                    setReplayIndex(Number(e.target.value));
                    setReplayPlaying(false);
                  }}
                  className="flex-1 h-1.5 appearance-none bg-slate-700 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <select
                  value={replaySpeed}
                  onChange={(e) => setReplaySpeed(Number(e.target.value) as typeof replaySpeed)}
                  className="bg-slate-800 border-slate-600 text-white text-xs rounded px-2 py-1 w-16"
                >
                  {REPLAY_SPEEDS.map((speed) => (
                    <option key={speed} value={speed}>
                      {speed}x
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 font-mono min-w-[60px] text-right">
                  {currentReplayPoint ? formatTimestamp(currentReplayPoint.recordedAt) : "--:--:--"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
