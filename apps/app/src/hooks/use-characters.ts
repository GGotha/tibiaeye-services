import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCharacters() {
  return useQuery({
    queryKey: ["characters"],
    queryFn: () => api.getCharacters(),
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ["character", id],
    queryFn: () => api.getCharacter(id),
    enabled: !!id,
  });
}

export function useCharacterSessions(id: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["character-sessions", id, params],
    queryFn: () => api.getCharacterSessions(id, params),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => api.createCharacter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteCharacter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
