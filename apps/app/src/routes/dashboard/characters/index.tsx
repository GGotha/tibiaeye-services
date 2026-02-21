import { AddCharacterDialog } from "@/components/characters/add-character-dialog";
import { CharactersList } from "@/components/characters/characters-list";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCharacters, useCreateCharacter, useDeleteCharacter } from "@/hooks/use-characters";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/characters/")({
  component: CharactersPage,
});

function CharactersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteCharacterId, setDeleteCharacterId] = useState<string | null>(null);
  const { data: characters = [] } = useCharacters();
  const createCharacter = useCreateCharacter();
  const deleteCharacter = useDeleteCharacter();

  const handleAddCharacter = async (data: { name: string }) => {
    await createCharacter.mutateAsync(data);
  };

  const handleDeleteCharacter = (id: string) => {
    setDeleteCharacterId(id);
  };

  const confirmDeleteCharacter = async () => {
    if (deleteCharacterId) {
      await deleteCharacter.mutateAsync(deleteCharacterId);
      setDeleteCharacterId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Characters</h1>

      <CharactersList
        characters={characters}
        onAddClick={() => setIsDialogOpen(true)}
        onDelete={handleDeleteCharacter}
      />

      <AddCharacterDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddCharacter}
        isLoading={createCharacter.isPending}
      />

      <ConfirmDialog
        open={!!deleteCharacterId}
        onOpenChange={(open) => !open && setDeleteCharacterId(null)}
        title="Excluir personagem"
        description="Tem certeza que deseja excluir este personagem? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={confirmDeleteCharacter}
        isLoading={deleteCharacter.isPending}
      />
    </div>
  );
}
