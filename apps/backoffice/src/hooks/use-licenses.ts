import { adminApi } from "@/lib/admin-api";
import type { LicenseFilters } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useLicenses(filters?: LicenseFilters) {
  return useQuery({
    queryKey: ["admin", "licenses", filters],
    queryFn: () => adminApi.getLicenses(filters),
  });
}

export function useLicenseStats() {
  return useQuery({
    queryKey: ["admin", "licenses", "stats"],
    queryFn: () => adminApi.getLicenseStats(),
  });
}

export function useRevokeLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.revokeLicense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "licenses"] });
    },
  });
}

export function useExtendLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => adminApi.extendLicense(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "licenses"] });
    },
  });
}

export function useBulkExtendLicenses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, days }: { ids: string[]; days: number }) =>
      adminApi.bulkExtendLicenses(ids, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "licenses"] });
    },
  });
}
