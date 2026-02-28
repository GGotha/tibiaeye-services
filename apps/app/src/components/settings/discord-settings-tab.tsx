import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import {
  useCreateDiscordIntegration,
  useDeleteDiscordIntegration,
  useDiscordIntegrations,
  useTestDiscordIntegration,
  useUpdateDiscordIntegration,
} from "@/hooks/use-discord";
import type { DiscordIntegration, NotificationPreferences } from "@/types";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  sessionStarted: true,
  sessionEnded: true,
  death: true,
  levelUp: true,
  lootDrop: { enabled: false, minValue: 10000 },
  lowHp: { enabled: false, threshold: 20 },
  botStuck: true,
  periodicStats: { enabled: true, intervalMinutes: 5 },
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2"
    >
      <span className="text-sm text-slate-300">{label}</span>
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

interface IntegrationFormState {
  label: string;
  webhookUrl: string;
  preferences: NotificationPreferences;
}

function IntegrationDialog({
  open,
  onOpenChange,
  integration,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration?: DiscordIntegration;
}) {
  const isEditing = !!integration;

  const [form, setForm] = useState<IntegrationFormState>({
    label: integration?.label ?? "",
    webhookUrl: "",
    preferences: integration?.notificationPreferences ?? { ...DEFAULT_PREFERENCES },
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateDiscordIntegration();
  const updateMutation = useUpdateDiscordIntegration();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: integration.id,
          input: {
            label: form.label,
            ...(form.webhookUrl ? { webhookUrl: form.webhookUrl } : {}),
            notificationPreferences: form.preferences,
          },
        });
      } else {
        if (!form.webhookUrl) {
          setError("Webhook URL is required");
          return;
        }
        await createMutation.mutateAsync({
          label: form.label,
          webhookUrl: form.webhookUrl,
          notificationPreferences: form.preferences,
        });
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? "Editar integração" : "Nova integração Discord"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing
              ? "Atualize as configurações da integração"
              : "Configure um webhook do Discord para receber notificações"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="label" className="text-slate-300">
              Nome
            </Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Ex: Canal de Hunts"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl" className="text-slate-300">
              Webhook URL {isEditing && "(deixe vazio para manter)"}
            </Label>
            <Input
              id="webhookUrl"
              value={form.webhookUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, webhookUrl: e.target.value }))}
              placeholder="https://discord.com/api/webhooks/..."
              className="bg-slate-800 border-slate-700 text-white"
              required={!isEditing}
            />
            <p className="text-xs text-slate-500">
              No Discord: Configurações do Canal &gt; Integrações &gt; Webhooks &gt; Novo Webhook
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-white">Notificações</h4>
            <div className="space-y-1 rounded-lg border border-slate-800 p-3">
              <Toggle
                checked={form.preferences.sessionStarted}
                onChange={(v) => updatePreference("sessionStarted", v)}
                label="Sessão iniciada"
              />
              <Toggle
                checked={form.preferences.sessionEnded}
                onChange={(v) => updatePreference("sessionEnded", v)}
                label="Sessão encerrada"
              />
              <Toggle
                checked={form.preferences.death}
                onChange={(v) => updatePreference("death", v)}
                label="Morte"
              />
              <Toggle
                checked={form.preferences.levelUp}
                onChange={(v) => updatePreference("levelUp", v)}
                label="Level Up"
              />
              <Toggle
                checked={form.preferences.botStuck}
                onChange={(v) => updatePreference("botStuck", v)}
                label="Bot travado"
              />

              <div className="border-t border-slate-800 pt-2 mt-2">
                <Toggle
                  checked={form.preferences.lootDrop.enabled}
                  onChange={(v) =>
                    updatePreference("lootDrop", { ...form.preferences.lootDrop, enabled: v })
                  }
                  label="Loot valioso"
                />
                {form.preferences.lootDrop.enabled && (
                  <div className="pl-4 pb-2">
                    <Label className="text-xs text-slate-500">Valor mínimo (gold)</Label>
                    <Input
                      type="number"
                      value={form.preferences.lootDrop.minValue}
                      onChange={(e) =>
                        updatePreference("lootDrop", {
                          ...form.preferences.lootDrop,
                          minValue: Number(e.target.value),
                        })
                      }
                      className="bg-slate-800 border-slate-700 text-white h-8 mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-2">
                <Toggle
                  checked={form.preferences.lowHp.enabled}
                  onChange={(v) =>
                    updatePreference("lowHp", { ...form.preferences.lowHp, enabled: v })
                  }
                  label="HP baixo"
                />
                {form.preferences.lowHp.enabled && (
                  <div className="pl-4 pb-2">
                    <Label className="text-xs text-slate-500">Threshold (%)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={form.preferences.lowHp.threshold}
                      onChange={(e) =>
                        updatePreference("lowHp", {
                          ...form.preferences.lowHp,
                          threshold: Number(e.target.value),
                        })
                      }
                      className="bg-slate-800 border-slate-700 text-white h-8 mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 pt-2">
                <Toggle
                  checked={form.preferences.periodicStats.enabled}
                  onChange={(v) =>
                    updatePreference("periodicStats", {
                      ...form.preferences.periodicStats,
                      enabled: v,
                    })
                  }
                  label="Stats periódicos"
                />
                {form.preferences.periodicStats.enabled && (
                  <div className="pl-4 pb-2">
                    <Label className="text-xs text-slate-500">Intervalo</Label>
                    <Select
                      value={String(form.preferences.periodicStats.intervalMinutes)}
                      onValueChange={(v) =>
                        updatePreference("periodicStats", {
                          ...form.preferences.periodicStats,
                          intervalMinutes: Number(v),
                        })
                      }
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="5">5 minutos</SelectItem>
                        <SelectItem value="10">10 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IntegrationCard({ integration }: { integration: DiscordIntegration }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [testMessage, setTestMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const deleteMutation = useDeleteDiscordIntegration();
  const testMutation = useTestDiscordIntegration();
  const updateMutation = useUpdateDiscordIntegration();

  const handleTest = async () => {
    setTestMessage(null);
    try {
      const result = await testMutation.mutateAsync(integration.id);
      setTestMessage(
        result.success
          ? { type: "success", text: "Notificação enviada!" }
          : { type: "error", text: "Falha ao enviar" }
      );
    } catch (err) {
      setTestMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao testar",
      });
    }
  };

  const handleToggleActive = async () => {
    await updateMutation.mutateAsync({
      id: integration.id,
      input: { isActive: !integration.isActive },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-white truncate">{integration.label}</h4>
            <Badge
              className={
                integration.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
              }
            >
              {integration.isActive ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          {integration.guildName && (
            <p className="text-sm text-slate-500 mt-0.5">{integration.guildName}</p>
          )}
          {testMessage && (
            <p
              className={`text-xs mt-1 ${testMessage.type === "success" ? "text-emerald-400" : "text-red-400"}`}
            >
              {testMessage.text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleActive}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
            title={integration.isActive ? "Desativar" : "Ativar"}
            disabled={updateMutation.isPending}
          >
            <div
              className={`w-2 h-2 rounded-full ${integration.isActive ? "bg-emerald-400" : "bg-slate-600"}`}
            />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTest}
            disabled={testMutation.isPending}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
            title="Testar"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditOpen(true)}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <IntegrationDialog open={isEditOpen} onOpenChange={setIsEditOpen} integration={integration} />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir integração"
        description={`Tem certeza que deseja excluir a integração "${integration.label}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        onConfirm={() => {
          deleteMutation.mutate(integration.id);
          setIsDeleteOpen(false);
        }}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export function DiscordSettingsTab() {
  const { data: integrations, isLoading } = useDiscordIntegrations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const hasIntegrations = integrations && integrations.length > 0;

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Integrações Discord</CardTitle>
              <CardDescription className="text-slate-400">
                Receba notificações no Discord sobre suas sessões de hunt
              </CardDescription>
            </div>
            {hasIntegrations && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-black"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-slate-400 text-sm">Carregando...</p>}

          {!isLoading && !hasIntegrations && (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-2">Nenhuma integração configurada</p>
              <p className="text-sm text-slate-500 mb-4">
                Crie um webhook no Discord (Configurações do Canal &gt; Integrações &gt; Webhooks) e
                cole a URL aqui para receber notificações.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar integração
              </Button>
            </div>
          )}

          {hasIntegrations &&
            integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
        </CardContent>
      </Card>

      <IntegrationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
