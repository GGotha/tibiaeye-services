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
import { useRevokeLicense } from "@/hooks/use-licenses";
import type { License } from "@/types";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface RevokeLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: License | null;
}

export function RevokeLicenseDialog({ open, onOpenChange, license }: RevokeLicenseDialogProps) {
  const [reason, setReason] = useState("");
  const revokeLicense = useRevokeLicense();

  if (!license) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    try {
      await revokeLicense.mutateAsync({ id: license.id, reason });
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
            <AlertTriangle className="h-5 w-5" />
            Revogar Licenca
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Esta acao e destrutiva e nao pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm">
            <p className="text-red-400 font-medium mb-1">Atencao!</p>
            <p className="text-slate-300">
              A licenca <code className="text-orange-400">{license.keyPrefix}...</code> do usuario{" "}
              <span className="text-white font-medium">
                {license.userName || license.userEmail}
              </span>{" "}
              sera revogada permanentemente.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Motivo da revogacao</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo..."
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
            disabled={!reason.trim() || revokeLicense.isPending}
            variant="destructive"
          >
            {revokeLicense.isPending ? "Revogando..." : "Revogar Licenca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
