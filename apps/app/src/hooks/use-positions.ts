import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useSessionPositions(sessionId?: string, enabled = true) {
  return useQuery({
    queryKey: ["session-positions", sessionId],
    queryFn: () => api.getSessionPositions(sessionId!),
    enabled: !!sessionId && enabled,
  });
}
