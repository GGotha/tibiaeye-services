import { adminApi } from "@/lib/admin-api";
import type { MaintenanceMode } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "settings", "feature-flags"],
    queryFn: () => adminApi.getFeatureFlags(),
  });
}

export function useSetFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      adminApi.setFeatureFlag(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "feature-flags"] });
    },
  });
}

export function useMaintenanceMode() {
  return useQuery({
    queryKey: ["admin", "settings", "maintenance"],
    queryFn: () => adminApi.getMaintenanceMode(),
  });
}

export function useSetMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaintenanceMode) => adminApi.setMaintenanceMode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "maintenance"] });
    },
  });
}
