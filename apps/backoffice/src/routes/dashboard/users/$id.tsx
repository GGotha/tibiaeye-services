import { BanUserDialog } from "@/components/dialogs/ban-user-dialog";
import { ExtendLicenseDialog } from "@/components/dialogs/extend-license-dialog";
import { GiveLicenseDialog } from "@/components/dialogs/give-license-dialog";
import { RevokeLicenseDialog } from "@/components/dialogs/revoke-license-dialog";
import { SuspendUserDialog } from "@/components/dialogs/suspend-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnsuspendUser, useUser } from "@/hooks/use-users";
import { formatCurrencyPrecise, formatDate, getRelativeTime } from "@/lib/utils";
import type { License } from "@/types";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  Calendar,
  CheckCircle,
  Key,
  Plus,
  Shield,
  User,
  UserX,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/users/$id")({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { id } = Route.useParams();
  const { data: user, isLoading } = useUser(id);
  const unsuspendUser = useUnsuspendUser();

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [giveLicenseOpen, setGiveLicenseOpen] = useState(false);
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; license: License | null }>({
    open: false,
    license: null,
  });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; license: License | null }>({
    open: false,
    license: null,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-8 text-center">
        <p className="text-sm text-slate-500">Usuario nao encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className="flex items-center gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
      >
        <Link to="/dashboard/users">
          <Button variant="ghost" size="icon" className="text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{user.name || "Sem nome"}</h1>
          <p className="text-slate-400">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={() => setGiveLicenseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Conceder Licenca
          </Button>
          {user.status === "active" && (
            <Button
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => setSuspendOpen(true)}
            >
              <UserX className="h-4 w-4 mr-2" />
              Suspender
            </Button>
          )}
          {user.status === "suspended" && (
            <Button
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => unsuspendUser.mutate(id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reativar
            </Button>
          )}
          {user.status !== "banned" && (
            <Button
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => setBanOpen(true)}
            >
              <Ban className="h-4 w-4 mr-2" />
              Banir
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-white">Informacoes</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Status</span>
              <Badge
                className={
                  user.status === "active"
                    ? "bg-emerald-500/20 text-emerald-400 border-0"
                    : user.status === "suspended"
                      ? "bg-yellow-500/20 text-yellow-400 border-0"
                      : "bg-red-500/20 text-red-400 border-0"
                }
              >
                {user.status === "active"
                  ? "Ativo"
                  : user.status === "suspended"
                    ? "Suspenso"
                    : "Banido"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Funcao</span>
              <span className="text-white text-sm">{user.role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Cadastro</span>
              <span className="text-white text-sm">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Ultimo Login</span>
              <span className="text-white text-sm">
                {user.lastLoginAt ? getRelativeTime(user.lastLoginAt) : "Nunca"}
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-white">Assinatura</h3>
          </div>
          {user.subscription ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Plano</span>
                <span className="text-white text-sm">{user.subscription.plan.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <Badge
                  className={
                    user.subscription.status === "active"
                      ? "bg-emerald-500/20 text-emerald-400 border-0"
                      : "bg-slate-500/20 text-slate-400 border-0"
                  }
                >
                  {user.subscription.status === "active" ? "Ativa" : user.subscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Preco</span>
                <span className="text-white text-sm">
                  {formatCurrencyPrecise(user.subscription.plan.price)}/
                  {user.subscription.plan.interval}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Renova</span>
                <span className="text-white text-sm">
                  {formatDate(user.subscription.currentPeriodEnd)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4 text-sm">Sem assinatura ativa</p>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-medium text-white">API Keys</h3>
          </div>
          <div className="text-3xl font-bold text-white">{user.apiKeys.length}</div>
          <p className="text-slate-400 text-sm">Chaves ativas</p>
          {user.apiKeys.length > 0 && (
            <div className="mt-4 space-y-2">
              {user.apiKeys.slice(0, 3).map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between text-sm p-2 bg-slate-800/50 rounded-lg"
                >
                  <code className="text-slate-300 text-xs">{key.keyPrefix}...</code>
                  <Badge
                    className={
                      key.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border-0"
                        : "bg-red-500/20 text-red-400 border-0"
                    }
                  >
                    {key.status === "active" ? "Ativa" : "Revogada"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <Tabs defaultValue="licenses" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="licenses">Licencas ({user.licenses.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessoes ({user.recentSessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="licenses">
            <div className="glass rounded-xl p-6">
              {user.licenses.length > 0 ? (
                <div className="space-y-2">
                  {user.licenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                    >
                      <div>
                        <code className="text-slate-300 text-sm">{license.keyPrefix}...</code>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Expira em {formatDate(license.expiresAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            license.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border-0"
                              : license.status === "expired"
                                ? "bg-yellow-500/20 text-yellow-400 border-0"
                                : "bg-red-500/20 text-red-400 border-0"
                          }
                        >
                          {license.status === "active"
                            ? "Ativa"
                            : license.status === "expired"
                              ? "Expirada"
                              : "Revogada"}
                        </Badge>
                        {license.status !== "revoked" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-white"
                            onClick={() => setExtendDialog({ open: true, license })}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {license.status === "active" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-400"
                            onClick={() => setRevokeDialog({ open: true, license })}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4 text-sm">Sem licencas</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="glass rounded-xl p-6">
              {user.recentSessions.length > 0 ? (
                <div className="space-y-2">
                  {user.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">{session.characterName}</p>
                        <p className="text-xs text-slate-500">
                          {session.huntLocation || "Local desconhecido"} -{" "}
                          {getRelativeTime(session.startedAt)}
                        </p>
                      </div>
                      <Badge
                        className={
                          session.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border-0"
                            : session.status === "completed"
                              ? "bg-slate-500/20 text-slate-400 border-0"
                              : "bg-red-500/20 text-red-400 border-0"
                        }
                      >
                        {session.status === "active"
                          ? "Ativa"
                          : session.status === "completed"
                            ? "Completa"
                            : session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4 text-sm">Sem sessoes recentes</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <SuspendUserDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        userId={id}
        userName={user.name || user.email}
      />
      <BanUserDialog
        open={banOpen}
        onOpenChange={setBanOpen}
        userId={id}
        userName={user.name || user.email}
      />
      <GiveLicenseDialog
        open={giveLicenseOpen}
        onOpenChange={setGiveLicenseOpen}
        preselectedUserId={id}
        preselectedUserName={user.name || user.email}
      />
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
    </div>
  );
}
