import { adminApi } from "@/lib/admin-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useGivePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      planId,
      durationDays,
    }: {
      userId: string;
      planId: string;
      durationDays: number;
    }) => adminApi.givePlan(userId, planId, durationDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "licenses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "license-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
}
