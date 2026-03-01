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
import { useBanUser } from "@/hooks/use-users";
import { ShieldOff } from "lucide-react";
import { useState } from "react";

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export function BanUserDialog({ open, onOpenChange, userId, userName }: BanUserDialogProps) {
  const [reason, setReason] = useState("");
  const banUser = useBanUser();

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await banUser.mutateAsync({ id: userId, reason });
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
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <ShieldOff className="h-5 w-5" />
            Banir Usuario
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Esta acao e permanente. O usuario perdera todo acesso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
            <p className="text-red-400 font-medium mb-1">Banindo permanentemente:</p>
            <p className="text-white">{userName}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Motivo</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo do banimento..."
              rows={3}
              className="w-full rounded-md bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
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
            disabled={!reason.trim() || banUser.isPending}
            variant="destructive"
          >
            {banUser.isPending ? "Banindo..." : "Banir Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
