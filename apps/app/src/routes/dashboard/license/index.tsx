import { LicenseStatusCard } from "@/components/cards/license-status-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLicenseStatus, useRegenerateLicenseKey, useSubscription } from "@/hooks/use-license";
import { cn, formatDate } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Key, RefreshCw, Shield } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/license/")({
  component: LicensePage,
});

function LicensePage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedNewKey, setCopiedNewKey] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const { data: license } = useLicenseStatus();
  const { data: subscription } = useSubscription();
  const regenerateMutation = useRegenerateLicenseKey();

  const handleCopyKey = () => {
    if (license?.keyPrefix) {
      navigator.clipboard.writeText(license.keyPrefix);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyNewKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopiedNewKey(true);
      setTimeout(() => setCopiedNewKey(false), 2000);
    }
  };

  const handleRegenerate = () => {
    regenerateMutation.mutate(undefined, {
      onSuccess: (data) => {
        setNewKey(data.licenseKey);
        setConfirmOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">License</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LicenseStatusCard license={license} />

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-xl font-bold text-white">{subscription.plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge
                    className={cn(
                      subscription.status === "active" &&
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      subscription.status === "cancelled" &&
                        "bg-red-500/10 text-red-400 border-red-500/20",
                      subscription.status === "past_due" &&
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    )}
                  >
                    {subscription.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Next billing</span>
                  <span className="text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-4">No active subscription</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              License Key
            </CardTitle>
            {license && !newKey && (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setConfirmOpen(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar Key
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {newKey ? (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-400 font-medium mb-1">
                  Salve sua nova license key agora!
                </p>
                <p className="text-xs text-yellow-400/70">
                  Essa key sera exibida apenas uma vez. Se voce perder, precisara regenerar
                  novamente.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-emerald-400 break-all">{newKey}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={handleCopyNewKey}
                  >
                    {copiedNewKey ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : license ? (
            <>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-emerald-400">{license.keyPrefix}...</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyKey}>
                    {copiedKey ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Created: {formatDate(license.createdAt)}
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 mb-4">
                Nenhuma license key encontrada. Gere uma nova para usar o TibiaEye.
              </p>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-black"
                onClick={() => setConfirmOpen(true)}
                disabled={regenerateMutation.isPending}
              >
                <Key className="h-4 w-4 mr-2" />
                Gerar License Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {license ? "Regenerar License Key" : "Gerar License Key"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {license
                ? "Sua key atual sera revogada imediatamente e uma nova sera gerada. Qualquer bot usando a key antiga deixara de funcionar."
                : "Uma nova license key sera gerada. Voce precisara salva-la pois ela sera exibida apenas uma vez."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending}
            >
              {regenerateMutation.isPending ? "Gerando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
