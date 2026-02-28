import { api } from "@/lib/api";
import type { CreateDiscordIntegrationInput, UpdateDiscordIntegrationInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["discord-integrations"];

export function useDiscordIntegrations() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.getDiscordIntegrations(),
  });
}

export function useCreateDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDiscordIntegrationInput) => api.createDiscordIntegration(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDiscordIntegrationInput }) =>
      api.updateDiscordIntegration(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteDiscordIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteDiscordIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useTestDiscordIntegration() {
  return useMutation({
    mutationFn: (id: string) => api.testDiscordIntegration(id),
  });
}
