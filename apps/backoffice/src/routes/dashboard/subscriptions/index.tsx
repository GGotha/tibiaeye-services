import { SubscriptionsTable } from "@/components/tables/subscriptions-table";
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
import { usePlans } from "@/hooks/use-plans";
import {
  useCancelSubscription,
  useExtendSubscription,
  useSubscriptions,
} from "@/hooks/use-subscriptions";
import type { Subscription } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/subscriptions/")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [status, setStatus] = useState<string>("all");
  const [planId, setPlanId] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; sub: Subscription | null }>({
    open: false,
    sub: null,
  });
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; sub: Subscription | null }>({
    open: false,
    sub: null,
  });
  const [extendDays, setExtendDays] = useState(30);

  const { data: plans } = usePlans();
  const { data, isLoading } = useSubscriptions({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
    planId: planId !== "all" ? planId : undefined,
  });

  const cancelSubscription = useCancelSubscription();
  const extendSubscription = useExtendSubscription();

  const handleCancelConfirm = async () => {
    if (!cancelDialog.sub) return;
    try {
      await cancelSubscription.mutateAsync({ id: cancelDialog.sub.id });
      setCancelDialog({ open: false, sub: null });
    } catch {
      // Error handled by mutation
    }
  };

  const handleExtendConfirm = async () => {
    if (!extendDialog.sub || extendDays < 1) return;
    try {
      await extendSubscription.mutateAsync({ id: extendDialog.sub.id, days: extendDays });
      setExtendDialog({ open: false, sub: null });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-5">
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Financeiro</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Assinaturas</h1>
      </div>

      <div
        className="flex items-center gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
            <SelectItem value="past_due">Atrasadas</SelectItem>
            <SelectItem value="trialing">Em teste</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={planId}
          onValueChange={(v) => {
            setPlanId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">Todos os Planos</SelectItem>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : data?.data.length ? (
          <>
            <SubscriptionsTable
              subscriptions={data.data}
              onCancel={(sub) => setCancelDialog({ open: true, sub })}
              onExtend={(sub) => setExtendDialog({ open: true, sub })}
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">
                Mostrando {data.data.length} de {data.total} assinaturas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-700"
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-400">
                  Pagina {page} de {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                  className="border-slate-700"
                >
                  Proxima
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
            <CreditCard className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhuma assinatura encontrada</p>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ open, sub: cancelDialog.sub })}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Cancelar Assinatura</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja cancelar a assinatura de {cancelDialog.sub?.userEmail}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialog({ open: false, sub: null })}
              className="border-slate-700 text-slate-300"
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending ? "Cancelando..." : "Cancelar Assinatura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog
        open={extendDialog.open}
        onOpenChange={(open) => setExtendDialog({ open, sub: extendDialog.sub })}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Estender Assinatura</DialogTitle>
            <DialogDescription className="text-slate-400">
              Estender assinatura de {extendDialog.sub?.userEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-slate-300">Dias para estender</Label>
            <Input
              type="number"
              min={1}
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExtendDialog({ open: false, sub: null })}
              className="border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handleExtendConfirm}
              disabled={extendDays < 1 || extendSubscription.isPending}
            >
              {extendSubscription.isPending ? "Estendendo..." : "Estender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
