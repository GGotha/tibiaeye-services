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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGivePlan } from "@/hooks/use-give-plan";
import { usePlans } from "@/hooks/use-plans";
import { useUsers } from "@/hooks/use-users";
import { useState } from "react";

interface GiveLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedUserId?: string;
  preselectedUserName?: string;
}

export function GiveLicenseDialog({
  open,
  onOpenChange,
  preselectedUserId,
  preselectedUserName,
}: GiveLicenseDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(preselectedUserId || "");
  const [selectedUserLabel, setSelectedUserLabel] = useState(preselectedUserName || "");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [generatedKey, setGeneratedKey] = useState("");

  const { data: usersData } = useUsers({ search, limit: 5 });
  const { data: plans } = usePlans();
  const givePlan = useGivePlan();

  const activePlans = plans?.filter((p) => p.isActive) || [];
  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedPlanId || durationDays < 1) return;

    try {
      const result = await givePlan.mutateAsync({
        userId: selectedUserId,
        planId: selectedPlanId,
        durationDays,
      });
      setGeneratedKey(result.keyPrefix || "Licenca concedida com sucesso");
    } catch {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setSearch("");
    setSelectedUserId(preselectedUserId || "");
    setSelectedUserLabel(preselectedUserName || "");
    setSelectedPlanId("");
    setDurationDays(30);
    setGeneratedKey("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Conceder Licenca</DialogTitle>
          <DialogDescription className="text-slate-400">
            Conceder uma licenca de plano para um usuario.
          </DialogDescription>
        </DialogHeader>

        {generatedKey ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="text-sm text-emerald-400 font-medium mb-2">Licenca concedida!</p>
              <code className="text-xs text-white bg-slate-800 px-3 py-1.5 rounded font-mono">
                {generatedKey}
              </code>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-700 text-slate-300"
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User selection */}
            {!preselectedUserId ? (
              <div className="space-y-2">
                <Label className="text-slate-300">Usuario</Label>
                <Input
                  placeholder="Buscar por email ou nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                {search && usersData?.data && usersData.data.length > 0 && (
                  <div className="rounded-lg border border-slate-700 bg-slate-800 max-h-32 overflow-y-auto">
                    {usersData.data.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedUserLabel(user.name || user.email);
                          setSearch("");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 text-slate-300"
                      >
                        {user.name || user.email}
                        <span className="text-xs text-slate-500 ml-2">{user.email}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedUserId && (
                  <p className="text-xs text-emerald-400">Selecionado: {selectedUserLabel}</p>
                )}
              </div>
            ) : (
              <div>
                <Label className="text-slate-300">Usuario</Label>
                <p className="text-sm text-white mt-1">{preselectedUserName}</p>
              </div>
            )}

            {/* Plan selection */}
            <div className="space-y-2">
              <Label className="text-slate-300">Plano</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Selecionar plano" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {activePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id} className="text-white">
                      {plan.name} - R${plan.price}/mes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-slate-300">Duracao (dias)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Preview */}
            {selectedPlan && (
              <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 text-sm">
                <p className="text-slate-400">Preview:</p>
                <p className="text-white mt-1">
                  Plano <span className="text-red-400 font-medium">{selectedPlan.name}</span> por{" "}
                  <span className="text-orange-400 font-medium">{durationDays} dias</span>
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Expira em:{" "}
                  {new Date(Date.now() + durationDays * 86400000).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-700 text-slate-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !selectedUserId || !selectedPlanId || durationDays < 1 || givePlan.isPending
                }
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {givePlan.isPending ? "Concedendo..." : "Conceder Licenca"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
