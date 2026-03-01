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
import { useExtendLicense } from "@/hooks/use-licenses";
import { formatDate } from "@/lib/utils";
import type { License } from "@/types";
import { useState } from "react";

interface ExtendLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: License | null;
}

export function ExtendLicenseDialog({ open, onOpenChange, license }: ExtendLicenseDialogProps) {
  const [days, setDays] = useState(30);
  const extendLicense = useExtendLicense();

  if (!license) return null;

  const currentExpiry = new Date(license.expiresAt);
  const newExpiry = new Date(currentExpiry.getTime() + days * 86400000);

  const handleSubmit = async () => {
    if (days < 1) return;
    try {
      await extendLicense.mutateAsync({ id: license.id, days });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Estender Licenca</DialogTitle>
          <DialogDescription className="text-slate-400">
            Estender a data de expiracao desta licenca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 text-sm space-y-1">
            <p className="text-slate-400">
              Usuario: <span className="text-white">{license.userName || license.userEmail}</span>
            </p>
            <p className="text-slate-400">
              Key: <code className="text-orange-400 text-xs">{license.keyPrefix}...</code>
            </p>
            <p className="text-slate-400">
              Expira em: <span className="text-white">{formatDate(license.expiresAt)}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Dias para estender</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
            <p className="text-emerald-400">
              Nova expiracao: {newExpiry.toLocaleDateString("pt-BR")}
            </p>
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
            disabled={days < 1 || extendLicense.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {extendLicense.isPending ? "Estendendo..." : "Estender"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
