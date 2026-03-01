import { MetricCard } from "@/components/cards/metric-card";
import { BanUserDialog } from "@/components/dialogs/ban-user-dialog";
import { GiveLicenseDialog } from "@/components/dialogs/give-license-dialog";
import { SuspendUserDialog } from "@/components/dialogs/suspend-user-dialog";
import { UsersTable } from "@/components/tables/users-table";
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
import { usePlatformStats } from "@/hooks/use-platform-analytics";
import { useUsers } from "@/hooks/use-users";
import { formatNumber } from "@/lib/utils";
import type { User } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, AlertTriangle, Search, UserPlus, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/users/")({
  component: UsersPage,
});

function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [banDialog, setBanDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [giveLicenseDialog, setGiveLicenseDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
  });

  const { data: stats } = usePlatformStats();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Gestao</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Usuarios</h1>
      </div>

      {/* Stats */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Metricas</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          <MetricCard
            title="Total"
            value={stats?.users?.total != null ? formatNumber(stats.users.total) : "-"}
            icon={Users}
            borderColor="border-t-blue-500/50"
          />
          <MetricCard
            title="Ativos Hoje"
            value={stats?.users?.activeToday != null ? formatNumber(stats.users.activeToday) : "-"}
            icon={Activity}
            borderColor="border-t-emerald-500/50"
          />
          <MetricCard
            title="Novos na Semana"
            value={stats?.users?.newThisWeek != null ? formatNumber(stats.users.newThisWeek) : "-"}
            icon={UserPlus}
            borderColor="border-t-orange-500/50"
          />
          <MetricCard
            title="Suspensos"
            value="-"
            icon={AlertTriangle}
            borderColor="border-t-yellow-500/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
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
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="suspended">Suspensos</SelectItem>
            <SelectItem value="banned">Banidos</SelectItem>
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
        ) : data?.data?.length ? (
          <>
            <UsersTable
              users={data.data}
              onSuspend={(user) => setSuspendDialog({ open: true, user })}
              onBan={(user) => setBanDialog({ open: true, user })}
              onGiveLicense={(user) =>
                setGiveLicenseDialog({
                  open: true,
                  userId: user.id,
                  userName: user.name || user.email,
                })
              }
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-400">
                Mostrando {data.data.length} de {data.total ?? 0} usuarios
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
                  Pagina {page} de {data?.totalPages ?? 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (data?.totalPages ?? 1)}
                  className="border-slate-700"
                >
                  Proxima
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
            <Users className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum usuario encontrado</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {suspendDialog.user && (
        <SuspendUserDialog
          open={suspendDialog.open}
          onOpenChange={(open) => setSuspendDialog({ open, user: suspendDialog.user })}
          userId={suspendDialog.user.id}
          userName={suspendDialog.user.name || suspendDialog.user.email}
        />
      )}
      {banDialog.user && (
        <BanUserDialog
          open={banDialog.open}
          onOpenChange={(open) => setBanDialog({ open, user: banDialog.user })}
          userId={banDialog.user.id}
          userName={banDialog.user.name || banDialog.user.email}
        />
      )}
      <GiveLicenseDialog
        open={giveLicenseDialog.open}
        onOpenChange={(open) => setGiveLicenseDialog((prev) => ({ ...prev, open }))}
        preselectedUserId={giveLicenseDialog.userId || undefined}
        preselectedUserName={giveLicenseDialog.userName || undefined}
      />
    </div>
  );
}
