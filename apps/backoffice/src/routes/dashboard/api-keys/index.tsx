import { ApiKeysTable } from "@/components/tables/api-keys-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys";
import type { ApiKey } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { Key } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/api-keys/")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; apiKey: ApiKey | null }>({
    open: false,
    apiKey: null,
  });

  const { data, isLoading } = useApiKeys({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
  });

  const revokeApiKey = useRevokeApiKey();

  const handleRevokeConfirm = async () => {
    if (!revokeDialog.apiKey) return;
    try {
      await revokeApiKey.mutateAsync(revokeDialog.apiKey.id);
      setRevokeDialog({ open: false, apiKey: null });
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
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Gestao</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">API Keys</h1>
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
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="revoked">Revogadas</SelectItem>
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
            <ApiKeysTable
              apiKeys={data.data}
              onRevoke={(apiKey) => setRevokeDialog({ open: true, apiKey })}
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">
                Mostrando {data.data.length} de {data.total} chaves
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
            <Key className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhuma chave encontrada</p>
          </div>
        )}
      </div>

      {/* Revoke Dialog */}
      <Dialog
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog({ open, apiKey: revokeDialog.apiKey })}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Revogar API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja revogar a chave "{revokeDialog.apiKey?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRevokeDialog({ open: false, apiKey: null })}
              className="border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeConfirm}
              disabled={revokeApiKey.isPending}
            >
              {revokeApiKey.isPending ? "Revogando..." : "Revogar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
