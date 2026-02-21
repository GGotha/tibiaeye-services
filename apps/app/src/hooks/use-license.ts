import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useLicenseStatus() {
  return useQuery({
    queryKey: ["license-status"],
    queryFn: () => api.getLicenseStatus(),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.getCurrentSubscription(),
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export function useRegenerateLicenseKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.regenerateLicenseKey(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["license-status"] });
    },
  });
}
