import { api } from "@/lib/api";
import type { SessionFilters } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => api.getSessions(filters),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => api.getSession(id),
    enabled: !!id,
  });
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ["sessions", "active"],
    queryFn: () => api.getActiveSessions(),
    refetchInterval: 30000,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
