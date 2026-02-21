import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeactivatePlan, usePlans } from "@/hooks/use-plans";
import { formatCurrencyPrecise } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Users, XCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/subscriptions/plans")({
  component: PlansPage,
});

function PlansPage() {
  const { data: plans, isLoading } = usePlans();
  const deactivatePlan = useDeactivatePlan();

  const handleDeactivate = (planId: string, planName: string) => {
    if (window.confirm(`Are you sure you want to deactivate the "${planName}" plan?`)) {
      deactivatePlan.mutate(planId);
    }
  };

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
        <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <Card
            key={plan.id}
            className={`bg-slate-900 border-slate-800 ${!plan.isActive ? "opacity-60" : ""}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{plan.name}</CardTitle>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold text-white">
                  {formatCurrencyPrecise(plan.price)}
                </span>
                <span className="text-slate-400">/{plan.interval}</span>
              </div>

              {plan.description && <p className="text-sm text-slate-400">{plan.description}</p>}

              <div className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4" />
                <span>{plan.subscribersCount} subscribers</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Features:</p>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Max Characters</span>
                  <span className="text-white">{plan.maxCharacters}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Max API Keys</span>
                  <span className="text-white">{plan.maxApiKeys}</span>
                </div>
              </div>

              {plan.isActive && (
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDeactivate(plan.id, plan.name)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deactivate Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
