import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useTibiaCharacter(name?: string) {
  return useQuery({
    queryKey: ["tibia-character", name],
    queryFn: () => api.getTibiaCharacter(name!),
    enabled: !!name,
    staleTime: FIVE_MINUTES,
  });
}

export function useTibiaWorld(name?: string) {
  return useQuery({
    queryKey: ["tibia-world", name],
    queryFn: () => api.getTibiaWorld(name!),
    enabled: !!name,
    staleTime: FIVE_MINUTES,
    refetchInterval: 60000,
  });
}

export function useTibiaWorlds() {
  return useQuery({
    queryKey: ["tibia-worlds"],
    queryFn: () => api.getTibiaWorlds(),
    staleTime: FIVE_MINUTES,
  });
}

export function useBoostedCreatures() {
  return useQuery({
    queryKey: ["boosted-creatures"],
    queryFn: () => api.getBoostedCreatures(),
    staleTime: FIFTEEN_MINUTES,
  });
}

export function useRashidLocation() {
  return useQuery({
    queryKey: ["rashid-location"],
    queryFn: () => api.getRashidLocation(),
    staleTime: FIFTEEN_MINUTES,
  });
}

export function useKillStatistics(world?: string) {
  return useQuery({
    queryKey: ["kill-statistics", world],
    queryFn: () => api.getKillStatistics(world!),
    enabled: !!world,
    staleTime: FIFTEEN_MINUTES,
  });
}
