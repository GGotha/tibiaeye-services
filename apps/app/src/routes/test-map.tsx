import { LiveMapDemo } from "@/components/map/live-map-demo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test-map")({
  component: TestMapPage,
});

function TestMapPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Live Map Test</h1>
        <LiveMapDemo />
      </div>
    </div>
  );
}
