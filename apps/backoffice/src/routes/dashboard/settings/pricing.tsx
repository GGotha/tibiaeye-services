import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/ui/section-label";
import { usePlans } from "@/hooks/use-plans";
import { formatCurrencyPrecise } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { DollarSign, Settings, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings/pricing")({
  component: PricingSettingsPage,
});

function PricingSettingsPage() {
  const { data: plans, isLoading } = usePlans();

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
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
          Configuracoes
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Precos e Limites</h1>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Planos Atuais</SectionLabel>
        <div className="glass rounded-xl p-6 mt-2">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-red-400" />
            <p className="text-sm text-slate-400">Planos disponiveis na plataforma</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 transition-colors ${!plan.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{plan.name}</h3>
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
                <p className="text-2xl font-bold text-white mb-2">
                  {formatCurrencyPrecise(plan.price)}
                  <span className="text-sm text-slate-400">/{plan.interval}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {plan.subscribersCount} assinantes
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {plan.maxCharacters} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="opacity-0 animate-fade-in"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <SectionLabel>Limites de Taxa</SectionLabel>
        <div className="glass rounded-xl p-6 mt-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-red-400" />
            <p className="text-sm text-slate-400">Configuracao de rate limits por plano</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-medium text-white text-sm mb-3">Limites de API</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Free</span>
                  <span>100 req/hora</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic</span>
                  <span>1.000 req/hora</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pro</span>
                  <span>10.000 req/hora</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Enterprise</span>
                  <span>Ilimitado</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-medium text-white text-sm mb-3">Limites de Sessao</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Free</span>
                  <span>1 simultanea</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic</span>
                  <span>3 simultaneas</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pro</span>
                  <span>10 simultaneas</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Enterprise</span>
                  <span>Ilimitado</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Os limites sao aplicados por chave de API. Entre em contato para ajustar limites de
            clientes especificos.
          </p>
        </div>
      </div>
    </div>
  );
}
