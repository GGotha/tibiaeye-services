import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionLabel } from "@/components/ui/section-label";
import { Switch } from "@/components/ui/switch";
import {
  useFeatureFlags,
  useMaintenanceMode,
  useSetFeatureFlag,
  useSetMaintenanceMode,
} from "@/hooks/use-settings";
import { formatDateTime } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Settings, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/settings/features")({
  component: FeaturesPage,
});

function FeaturesPage() {
  const { data: featureFlags, isLoading: loadingFlags } = useFeatureFlags();
  const { data: maintenance, isLoading: loadingMaintenance } = useMaintenanceMode();
  const setFeatureFlag = useSetFeatureFlag();
  const setMaintenanceMode = useSetMaintenanceMode();

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    if (maintenance) {
      setMaintenanceEnabled(maintenance.enabled);
      setMaintenanceMessage(maintenance.message || "");
    }
  }, [maintenance]);

  const handleFeatureToggle = (id: string, enabled: boolean) => {
    setFeatureFlag.mutate({ id, enabled });
  };

  const handleMaintenanceSave = () => {
    setMaintenanceMode.mutate({
      enabled: maintenanceEnabled,
      message: maintenanceMessage || null,
      scheduledEnd: null,
    });
  };

  if (loadingFlags || loadingMaintenance) {
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
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Configuracoes
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Feature Flags</h1>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Modo de Manutencao</SectionLabel>
        <div className="glass rounded-xl p-6 mt-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <p className="text-sm text-slate-400">Impede usuarios de acessar a plataforma</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-slate-300">Ativar Manutencao</Label>
              <p className="text-xs text-slate-500">Usuarios verao uma mensagem de manutencao</p>
            </div>
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
              className="data-[state=checked]:bg-yellow-500"
            />
          </div>

          {maintenanceEnabled && (
            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-300">
                Mensagem
              </Label>
              <Input
                id="message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Estamos em manutencao programada..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          )}

          <Button
            onClick={handleMaintenanceSave}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
            disabled={setMaintenanceMode.isPending}
          >
            {setMaintenanceMode.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Feature Flags</SectionLabel>
        <div className="glass rounded-xl p-6 mt-2 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <ToggleRight className="h-5 w-5 text-red-400" />
            <p className="text-sm text-slate-400">
              Ativar ou desativar funcionalidades da plataforma
            </p>
          </div>

          {featureFlags?.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
            >
              <div className="space-y-0.5">
                <p className="font-medium text-white text-sm">{flag.name}</p>
                <p className="text-xs text-slate-400">{flag.description}</p>
                <p className="text-xs text-slate-500">
                  Atualizado: {formatDateTime(flag.updatedAt)}
                </p>
              </div>
              <Switch
                checked={flag.enabled}
                onCheckedChange={(enabled) => handleFeatureToggle(flag.id, enabled)}
                disabled={setFeatureFlag.isPending}
              />
            </div>
          ))}

          {(!featureFlags || featureFlags.length === 0) && (
            <div className="text-center py-8 text-slate-400">
              <Settings className="h-10 w-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Nenhuma feature flag configurada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
