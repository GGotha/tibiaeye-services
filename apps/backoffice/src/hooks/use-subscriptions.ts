import { adminApi } from "@/lib/admin-api";
import type { SubscriptionFilters } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: ["admin", "subscriptions", filters],
    queryFn: () => adminApi.getSubscriptions(filters),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, immediate }: { id: string; immediate?: boolean }) =>
      adminApi.cancelSubscription(id, immediate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      adminApi.extendSubscription(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
    },
  });
}
