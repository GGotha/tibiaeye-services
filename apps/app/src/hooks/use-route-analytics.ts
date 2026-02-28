import { api } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useRouteSegments(routeId?: string) {
  return useQuery({
    queryKey: ["route-segments", routeId],
    queryFn: () => api.getRouteSegments(routeId!),
    enabled: !!routeId,
  });
}

export function useRouteSuggestions(routeId?: string) {
  return useMutation({
    mutationKey: ["route-suggestions", routeId],
    mutationFn: () => api.getRouteSuggestions(routeId!),
  });
}
