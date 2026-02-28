import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRoutes, useDeleteRoute, useCreateRoute, useImportRoute } from "@/hooks/use-routes";
import type { RouteWaypoint } from "@/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Map, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/dashboard/routes/")({
  component: RoutesPage,
});

function RoutesPage() {
  const { data: routes = [], isLoading } = useRoutes();
  const deleteRoute = useDeleteRoute();
  const createRoute = useCreateRoute();
  const importRoute = useImportRoute();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    const result = await createRoute.mutateAsync({ name: "New Route" });
    navigate({ to: `/dashboard/routes/${result.id}` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const json = JSON.parse(text) as { name?: string; waypoints?: RouteWaypoint[]; metadata?: Record<string, unknown> };
    const result = await importRoute.mutateAsync({
      name: json.name || file.name.replace(".json", ""),
      waypoints: json.waypoints || [],
      metadata: json.metadata,
    });
    navigate({ to: `/dashboard/routes/${result.id}` });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteRoute.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Routes</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Route
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-slate-400">Loading routes...</div>
      ) : routes.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
          <Map className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-white">No routes yet</h3>
          <p className="mt-2 text-sm text-slate-400">
            Create a new route or import an existing JSON file from the bot.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <div
              key={route.id}
              onClick={() => navigate({ to: `/dashboard/routes/${route.id}` })}
              onKeyDown={(e) => { if (e.key === "Enter") navigate({ to: `/dashboard/routes/${route.id}` }); }}
              className="group cursor-pointer rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-medium text-white">{route.name}</h3>
                  {route.description && (
                    <p className="mt-1 truncate text-sm text-slate-400">{route.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(route.id);
                  }}
                  className="ml-2 rounded p-1 text-slate-500 opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>{route.waypoints.length} waypoints</span>
                <span>{new Date(route.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Route"
        description="Are you sure you want to delete this route? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteRoute.isPending}
      />
    </div>
  );
}
