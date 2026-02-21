import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
  z: number;
}

// Tibia map constants - based on tibia-map-data images
const IMAGE_SIZE = 2048;
const MAP_MIN_X = 31744;
const MAP_MIN_Y = 30976;
const MAP_MAX_X = 33792;
const COORD_RANGE = MAP_MAX_X - MAP_MIN_X; // 2048

// Convert Tibia coordinates to image pixel coordinates
function tibiaToPixel(x: number, y: number): [number, number] {
  const pixelX = ((x - MAP_MIN_X) / COORD_RANGE) * IMAGE_SIZE;
  const pixelY = ((y - MAP_MIN_Y) / COORD_RANGE) * IMAGE_SIZE;
  return [pixelX, pixelY];
}

// Convert pixel to Leaflet LatLng (y is inverted in Leaflet)
function pixelToLatLng(pixelX: number, pixelY: number): L.LatLngExpression {
  return [-pixelY, pixelX];
}

// Get floor image URL from tibia-map-data
function getFloorImageUrl(floor: number): string {
  const floorStr = floor.toString().padStart(2, "0");
  return `https://tibiamaps.github.io/tibia-map-data/floor-${floorStr}-map.png`;
}

// Famous Tibia locations for testing
const DEMO_LOCATIONS: { name: string; pos: Position }[] = [
  { name: "Thais Depot", pos: { x: 32369, y: 32241, z: 7 } },
  { name: "Venore", pos: { x: 32957, y: 32076, z: 7 } },
  { name: "Carlin", pos: { x: 32360, y: 31782, z: 7 } },
  { name: "Ab'Dendriel", pos: { x: 32732, y: 31634, z: 7 } },
  { name: "Kazordoon", pos: { x: 32649, y: 31925, z: 7 } },
  { name: "Edron", pos: { x: 33217, y: 31814, z: 7 } },
  { name: "Darashia", pos: { x: 33213, y: 32454, z: 7 } },
  { name: "Ankrahmun", pos: { x: 33194, y: 32853, z: 7 } },
  { name: "Liberty Bay", pos: { x: 32317, y: 32826, z: 7 } },
  { name: "Port Hope", pos: { x: 32623, y: 32753, z: 7 } },
];

export function LiveMapDemo() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const imageLayerRef = useRef<L.ImageOverlay | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const [currentFloor, setCurrentFloor] = useState(7);
  const [position, setPosition] = useState<Position>(DEMO_LOCATIONS[0].pos);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize map
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      [-IMAGE_SIZE, IMAGE_SIZE],
    ];

    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      zoom: 0,
      center: [-IMAGE_SIZE / 2, IMAGE_SIZE / 2],
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
    });

    const imageLayer = L.imageOverlay(getFloorImageUrl(currentFloor), bounds).addTo(map);
    imageLayerRef.current = imageLayer;
    mapRef.current = map;

    // Click handler to set position
    map.on("click", (e) => {
      const pixelX = e.latlng.lng;
      const pixelY = -e.latlng.lat;
      const tibiaX = Math.round((pixelX / IMAGE_SIZE) * COORD_RANGE + MAP_MIN_X);
      const tibiaY = Math.round((pixelY / IMAGE_SIZE) * COORD_RANGE + MAP_MIN_Y);
      setPosition({ x: tibiaX, y: tibiaY, z: currentFloor });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update image when floor changes
  useEffect(() => {
    if (!imageLayerRef.current) return;
    imageLayerRef.current.setUrl(getFloorImageUrl(currentFloor));
  }, [currentFloor]);

  // Update marker when position changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const [pixelX, pixelY] = tibiaToPixel(position.x, position.y);
    const latLng = pixelToLatLng(pixelX, pixelY);

    if (position.z !== currentFloor) {
      setCurrentFloor(position.z);
    }

    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.circleMarker(latLng, {
        radius: 8,
        fillColor: "#10b981",
        fillOpacity: 1,
        color: "#ffffff",
        weight: 3,
      }).addTo(map);
    }

    map.setView(latLng, map.getZoom(), { animate: true, duration: 0.5 });
  }, [position, currentFloor]);

  // Simulate walking
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setPosition((prev) => ({
        x: prev.x + Math.floor(Math.random() * 3) - 1,
        y: prev.y + Math.floor(Math.random() * 3) - 1,
        z: prev.z,
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Live Map Demo</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={currentFloor}
              onChange={(e) => setCurrentFloor(Number(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((f) => (
                <option key={`floor-${f}`} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
        <p className="text-sm font-mono text-slate-400">
          {position.x}, {position.y}, {position.z}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={mapContainerRef}
          className="w-full h-[500px] rounded-lg overflow-hidden"
          style={{ background: "#0f172a" }}
        />

        {/* Demo controls */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              isSimulating
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
            }`}
          >
            {isSimulating ? "Stop Walking" : "Simulate Walking"}
          </button>

          {DEMO_LOCATIONS.map((loc) => (
            <button
              type="button"
              key={loc.name}
              onClick={() => setPosition(loc.pos)}
              className="px-3 py-1.5 rounded text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            >
              {loc.name}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          Click on the map to teleport. Use buttons above to jump to cities or simulate walking.
        </p>
      </CardContent>
    </Card>
  );
}
