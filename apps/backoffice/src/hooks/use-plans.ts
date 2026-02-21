import { adminApi } from "@/lib/admin-api";
import type { Plan } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => adminApi.getPlans(),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Plan, "id" | "subscribersCount">) => adminApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Plan> }) =>
      adminApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}

export function useDeactivatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deactivatePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
    },
  });
}
