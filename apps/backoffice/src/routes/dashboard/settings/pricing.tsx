import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Pricing & Rate Limits</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-400" />
            Current Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 bg-slate-800 rounded-lg ${!plan.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <Badge
                    className={
                      plan.isActive
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-500/20 text-slate-400"
                    }
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-white mb-2">
                  {formatCurrencyPrecise(plan.price)}
                  <span className="text-sm text-slate-400">/{plan.interval}</span>
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {plan.subscribersCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    {plan.maxCharacters} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-400" />
            Rate Limits Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">API Rate Limits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Free tier</span>
                  <span>100 req/hour</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic plan</span>
                  <span>1,000 req/hour</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pro plan</span>
                  <span>10,000 req/hour</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Enterprise</span>
                  <span>Unlimited</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg">
              <h4 className="font-medium text-white mb-2">Session Limits</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Free tier</span>
                  <span>1 concurrent</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Basic plan</span>
                  <span>3 concurrent</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pro plan</span>
                  <span>10 concurrent</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Enterprise</span>
                  <span>Unlimited</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Rate limits are enforced per API key. Contact support to adjust limits for specific
            customers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
