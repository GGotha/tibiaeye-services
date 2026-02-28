import { api } from "@/lib/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useExperienceHourly(sessionId?: string) {
  return useQuery({
    queryKey: ["experience-hourly", sessionId],
    queryFn: () => api.getExperienceHourly(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 30000,
  });
}

export function useKillsByCreature(sessionId?: string) {
  return useQuery({
    queryKey: ["kills-by-creature", sessionId],
    queryFn: () => api.getKillsByCreature(sessionId),
  });
}

export function useLootSummary(sessionId?: string) {
  return useQuery({
    queryKey: ["loot-summary", sessionId],
    queryFn: () => api.getLootSummary(sessionId),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
    refetchInterval: 30000,
  });
}

export function useGameEvents(sessionId?: string) {
  return useQuery({
    queryKey: ["game-events", sessionId],
    queryFn: () => api.getGameEvents(sessionId),
    enabled: !!sessionId,
  });
}

export function useProfit(params?: { sessionId?: string; characterId?: string; days?: number }) {
  return useQuery({
    queryKey: ["profit", params],
    queryFn: () => api.getProfit(params),
  });
}

export function useCompareSessions(sessionIds: string[]) {
  return useQuery({
    queryKey: ["compare-sessions", sessionIds],
    queryFn: () => api.compareSessions(sessionIds),
    enabled: sessionIds.length >= 2,
  });
}

export function useKillsHeatmap(sessionId?: string, startDate?: string) {
  return useQuery({
    queryKey: ["kills-heatmap", sessionId, startDate],
    queryFn: () => api.getKillsHeatmap(sessionId, startDate),
    enabled: !!sessionId,
  });
}

export function useHuntAnalytics() {
  return useQuery({
    queryKey: ["hunt-analytics"],
    queryFn: () => api.getHuntAnalytics(),
  });
}

export function usePositionHeatmap(sessionId?: string, startDate?: string) {
  return useQuery({
    queryKey: ["position-heatmap", sessionId, startDate],
    queryFn: () => api.getPositionHeatmap(sessionId!, startDate),
    enabled: !!sessionId,
  });
}

export function useTimeline(sessionId?: string, limit = 10) {
  return useQuery({
    queryKey: ["timeline", sessionId, limit],
    queryFn: () => api.getTimeline(sessionId!, { limit }),
    enabled: !!sessionId,
    refetchInterval: 30000,
  });
}

export function useTimelineInfinite(sessionId?: string) {
  return useInfiniteQuery({
    queryKey: ["timeline-infinite", sessionId],
    queryFn: ({ pageParam }) => api.getTimeline(sessionId!, { limit: 50, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!sessionId,
  });
}
