import type { BotRoute, RouteWaypoint } from "@/types";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRoutes() {
  return useQuery<BotRoute[]>({
    queryKey: ["routes"],
    queryFn: () => api.getRoutes(),
  });
}

export function useRoute(id: string) {
  return useQuery<BotRoute>({
    queryKey: ["routes", id],
    queryFn: () => api.getRoute(id),
    enabled: !!id,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; waypoints?: RouteWaypoint[] }) =>
      api.createRoute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      description?: string | null;
      waypoints?: RouteWaypoint[];
      isPublic?: boolean;
    }) => api.updateRoute(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["routes", variables.id] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}

export function useImportRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; waypoints: RouteWaypoint[]; metadata?: Record<string, unknown> }) =>
      api.importRoute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["routes"] }),
  });
}
