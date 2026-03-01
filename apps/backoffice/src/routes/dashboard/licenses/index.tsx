import { MetricCard } from "@/components/cards/metric-card";
import { BulkExtendDialog } from "@/components/dialogs/bulk-extend-dialog";
import { ExtendLicenseDialog } from "@/components/dialogs/extend-license-dialog";
import { GiveLicenseDialog } from "@/components/dialogs/give-license-dialog";
import { RevokeLicenseDialog } from "@/components/dialogs/revoke-license-dialog";
import { LicensesTable } from "@/components/tables/licenses-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLicenseStats, useLicenses } from "@/hooks/use-licenses";
import { formatNumber } from "@/lib/utils";
import type { License } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Calendar, CheckCircle, Plus, Search, Shield, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/licenses/")({
  component: LicensesPage,
});

function LicensesPage() {
  const [status, setStatus] = useState<string>("all");
  const [searchUser, setSearchUser] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [giveDialogOpen, setGiveDialogOpen] = useState(false);
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; license: License | null }>({
    open: false,
    license: null,
  });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; license: License | null }>({
    open: false,
    license: null,
  });
  const [bulkExtendOpen, setBulkExtendOpen] = useState(false);

  const { data: stats } = useLicenseStats();
  const { data, isLoading } = useLicenses({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
    search: searchUser || undefined,
  });

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data) {
      setSelectedIds(data.data.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="flex items-center justify-between opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Gestao</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">Licencas</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => setBulkExtendOpen(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Estender {selectedIds.length}
            </Button>
          )}
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => setGiveDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Conceder Licenca
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Metricas</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="Ativas"
            value={stats ? formatNumber(stats.active) : "-"}
            icon={CheckCircle}
            borderColor="border-t-emerald-500/50"
          />
          <MetricCard
            title="Expirando"
            value={stats ? formatNumber(stats.expiringThisWeek) : "-"}
            icon={AlertTriangle}
            borderColor="border-t-yellow-500/50"
          />
          <MetricCard
            title="Expiradas"
            value={stats ? formatNumber(stats.expired) : "-"}
            icon={Shield}
            borderColor="border-t-slate-500/50"
          />
          <MetricCard
            title="Revogadas"
            value={stats ? formatNumber(stats.revoked) : "-"}
            icon={XCircle}
            borderColor="border-t-red-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por usuario..."
            value={searchUser}
            onChange={(e) => {
              setSearchUser(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-slate-800 border-slate-700 text-white"
          />
        </div>
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
            <SelectItem value="expired">Expiradas</SelectItem>
            <SelectItem value="revoked">Revogadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "180ms", animationFillMode: "forwards" }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          </div>
        ) : data?.data.length ? (
          <>
            <LicensesTable
              licenses={data.data}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onRevoke={(license) => setRevokeDialog({ open: true, license })}
              onExtend={(license) => setExtendDialog({ open: true, license })}
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">
                Mostrando {data.data.length} de {data.total} licencas
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
            <Shield className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhuma licenca encontrada</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <GiveLicenseDialog open={giveDialogOpen} onOpenChange={setGiveDialogOpen} />
      <ExtendLicenseDialog
        open={extendDialog.open}
        onOpenChange={(open) => setExtendDialog({ open, license: extendDialog.license })}
        license={extendDialog.license}
      />
      <RevokeLicenseDialog
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog({ open, license: revokeDialog.license })}
        license={revokeDialog.license}
      />
      <BulkExtendDialog
        open={bulkExtendOpen}
        onOpenChange={setBulkExtendOpen}
        selectedIds={selectedIds}
      />
    </div>
  );
}
