import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionLabel } from "@/components/ui/section-label";
import { useDeactivatePlan, usePlans } from "@/hooks/use-plans";
import { formatCurrencyPrecise } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Users, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/subscriptions/plans")({
  component: PlansPage,
});

function PlansPage() {
  const { data: plans, isLoading } = usePlans();
  const deactivatePlan = useDeactivatePlan();
  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    planId: string;
    planName: string;
  }>({ open: false, planId: "", planName: "" });

  const handleDeactivateConfirm = async () => {
    if (!deactivateDialog.planId) return;
    try {
      await deactivatePlan.mutateAsync(deactivateDialog.planId);
      setDeactivateDialog({ open: false, planId: "", planName: "" });
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Financeiro</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Planos</h1>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Planos Disponiveis</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className={`glass gradient-border rounded-xl p-6 ${!plan.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <Badge
                  className={
                    plan.isActive
                      ? "bg-emerald-500/20 text-emerald-400 border-0"
                      : "bg-slate-500/20 text-slate-400 border-0"
                  }
                >
                  {plan.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="mb-3">
                <span className="text-3xl font-bold text-white">
                  {formatCurrencyPrecise(plan.price)}
                </span>
                <span className="text-slate-400 text-sm">/{plan.interval}</span>
              </div>

              {plan.description && (
                <p className="text-sm text-slate-400 mb-3">{plan.description}</p>
              )}

              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <Users className="h-4 w-4" />
                <span>{plan.subscribersCount} assinantes</span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-xs font-medium text-slate-300">Funcionalidades:</p>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-700/50 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Max Characters</span>
                  <span className="text-white">{plan.maxCharacters}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Max API Keys</span>
                  <span className="text-white">{plan.maxApiKeys}</span>
                </div>
              </div>

              {plan.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() =>
                    setDeactivateDialog({ open: true, planId: plan.id, planName: plan.name })
                  }
                >
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Desativar
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onOpenChange={(open) => setDeactivateDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Desativar Plano</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja desativar o plano "{deactivateDialog.planName}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeactivateDialog({ open: false, planId: "", planName: "" })}
              className="border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateConfirm}
              disabled={deactivatePlan.isPending}
            >
              {deactivatePlan.isPending ? "Desativando..." : "Desativar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
