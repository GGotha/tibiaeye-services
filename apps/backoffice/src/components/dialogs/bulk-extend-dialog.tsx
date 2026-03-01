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
import { useBulkExtendLicenses } from "@/hooks/use-licenses";
import { useState } from "react";

interface BulkExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
}

export function BulkExtendDialog({ open, onOpenChange, selectedIds }: BulkExtendDialogProps) {
  const [days, setDays] = useState(30);
  const bulkExtend = useBulkExtendLicenses();

  const handleSubmit = async () => {
    if (days < 1 || selectedIds.length === 0) return;
    try {
      await bulkExtend.mutateAsync({ ids: selectedIds, days });
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Estender Licencas em Lote</DialogTitle>
          <DialogDescription className="text-slate-400">
            Estender {selectedIds.length} licenca{selectedIds.length !== 1 ? "s" : ""} selecionada
            {selectedIds.length !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 text-sm text-center">
            <p className="text-2xl font-bold text-white">{selectedIds.length}</p>
            <p className="text-slate-400">licencas selecionadas</p>
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
            disabled={days < 1 || bulkExtend.isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {bulkExtend.isPending ? "Estendendo..." : `Estender ${selectedIds.length} Licencas`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
