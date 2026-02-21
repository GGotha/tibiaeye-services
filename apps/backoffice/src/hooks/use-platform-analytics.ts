import { adminApi } from "@/lib/admin-api";
import { useQuery } from "@tanstack/react-query";

export function usePlatformStats() {
  return useQuery({
    queryKey: ["admin", "analytics", "stats"],
    queryFn: () => adminApi.getPlatformStats(),
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useRevenueData(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery({
    queryKey: ["admin", "analytics", "revenue", period],
    queryFn: () => adminApi.getRevenueData(period),
  });
}

export function useUsageData(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery({
    queryKey: ["admin", "analytics", "usage", period],
    queryFn: () => adminApi.getUsageData(period),
  });
}

export function useActiveBotsCount() {
  return useQuery({
    queryKey: ["admin", "analytics", "bots-online"],
    queryFn: () => adminApi.getActiveBotsCount(),
    refetchInterval: 5 * 1000, // 5 seconds
  });
}
