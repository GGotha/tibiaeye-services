import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AddCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  isLoading?: boolean;
}

export function AddCharacterDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: AddCharacterDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name });
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Personagem</DialogTitle>
          <DialogDescription className="text-slate-400">
            Digite o nome do personagem. Os dados serão buscados automaticamente do Tibia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Nome do Personagem
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Bubble"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              {isLoading ? "Buscando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
