import { api } from "@/lib/api";
import type { BotConfig } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBotConfig(characterId: string) {
  return useQuery({
    queryKey: ["bot-config", characterId],
    queryFn: () => api.getBotConfig(characterId),
    enabled: !!characterId,
  });
}

export function useUpdateBotConfig(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: BotConfig) => api.updateBotConfig(characterId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-config", characterId] });
    },
  });
}

export function usePatchBotConfig(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<BotConfig>) => api.patchBotConfig(characterId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-config", characterId] });
    },
  });
}
