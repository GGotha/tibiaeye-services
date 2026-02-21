import { adminApi } from "@/lib/admin-api";
import type { ApiKeyFilters } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useApiKeys(filters?: ApiKeyFilters) {
  return useQuery({
    queryKey: ["admin", "api-keys", filters],
    queryFn: () => adminApi.getApiKeys(filters),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
    },
  });
}
