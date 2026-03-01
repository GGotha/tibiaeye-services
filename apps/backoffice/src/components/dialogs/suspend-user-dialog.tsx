import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSuspendUser } from "@/hooks/use-users";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function SuspendUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: SuspendUserDialogProps) {
  const [reason, setReason] = useState("");
  const suspendUser = useSuspendUser();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await suspendUser.mutateAsync({ id: userId, reason });
      setReason("");
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            Suspender Usuario
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            O usuario perdera acesso temporariamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
            <p className="text-yellow-400 font-medium mb-1">Suspendendo:</p>
            <p className="text-white">{userName}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Motivo</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da suspensao..."
              rows={3}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 text-slate-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || suspendUser.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {suspendUser.isPending ? "Suspendendo..." : "Suspender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
