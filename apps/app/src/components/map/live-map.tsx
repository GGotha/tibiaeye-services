import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Position {
  x: number;
  y: number;
  z: number;
}

interface LiveMapProps {
  position: Position | null;
  isConnected: boolean;
}

const TILE_URL_PREFIX = "https://tibiamaps.github.io/tibia-map-data/mapper/Minimap_Color_";
const BOUNDS = { xMin: 124, xMax: 133, yMin: 121, yMax: 128 };

const MAX_TRAIL_LENGTH = 50;
const DEFAULT_ZOOM = 2;

const STYLE_ID = "livemap-pulse-keyframes";

// Custom CRS matching tibiamaps.io — Tibia coordinates map directly to Leaflet
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

export function LiveMap({ position, isConnected }: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.GridLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const trailPointsRef = useRef<L.LatLng[]>([]);
  const [currentFloor, setCurrentFloor] = useState(7);
  const [autoFollow, setAutoFollow] = useState(true);
  const hasZoomedRef = useRef(false);

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
      L.latLng(-(BOUNDS.yMax + 1 + yPadding), BOUNDS.xMax + 1 + xPadding),
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

  // Update marker, trail, and camera when position changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;

    const latLng = tibiaToLatLng(map, position.x, position.y);

    // Auto-switch floor
    if (position.z !== currentFloor) {
      setCurrentFloor(position.z);
    }

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.marker(latLng, { icon: createCharacterIcon(), zIndexOffset: 1000 }).addTo(map);
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

    // Camera follow
    if (autoFollow) {
      if (!hasZoomedRef.current) {
        map.flyTo(latLng, DEFAULT_ZOOM, { animate: true, duration: 0.8 });
        hasZoomedRef.current = true;
      } else {
        map.flyTo(latLng, map.getZoom(), { animate: true, duration: 0.5 });
      }
    }
  }, [position, currentFloor, autoFollow]);

  const toggleAutoFollow = useCallback(() => {
    setAutoFollow((prev) => !prev);
  }, []);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Live Position</CardTitle>
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
            <select
              value={currentFloor}
              onChange={(e) => setCurrentFloor(Number(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
            >
              {Array.from({ length: 16 }, (_, i) => i).map((floorNum) => (
                <option key={`floor-${floorNum}`} value={floorNum}>
                  Floor {floorNum}{" "}
                  {floorNum === 7 ? "(ground)" : floorNum < 7 ? "(sky)" : "(underground)"}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span className="text-sm text-slate-400">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[500px] rounded-lg overflow-hidden"
            style={{ background: "#0f172a" }}
          />
          {position && (
            <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 border border-slate-700 rounded-md px-3 py-1.5">
              <span className="text-xs font-mono text-emerald-400">
                {position.x}, {position.y}, {position.z}
              </span>
            </div>
          )}
          {!position && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
              <span className="text-slate-500">Waiting for position data...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
