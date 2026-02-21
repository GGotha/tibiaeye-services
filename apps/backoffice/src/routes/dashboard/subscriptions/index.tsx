import { SubscriptionsTable } from "@/components/tables/subscriptions-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlans } from "@/hooks/use-plans";
import {
  useCancelSubscription,
  useExtendSubscription,
  useSubscriptions,
} from "@/hooks/use-subscriptions";
import type { Subscription } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/subscriptions/")({
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [status, setStatus] = useState<string>("all");
  const [planId, setPlanId] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: plans } = usePlans();
  const { data, isLoading } = useSubscriptions({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
    planId: planId !== "all" ? planId : undefined,
  });

  const cancelSubscription = useCancelSubscription();
  const extendSubscription = useExtendSubscription();

  const handleCancel = (subscription: Subscription) => {
    if (window.confirm(`Cancel subscription for ${subscription.userEmail}?`)) {
      cancelSubscription.mutate({ id: subscription.id });
    }
  };

  const handleExtend = (subscription: Subscription) => {
    const daysStr = window.prompt("Enter number of days to extend:");
    const days = daysStr ? Number.parseInt(daysStr, 10) : 0;
    if (days > 0) {
      extendSubscription.mutate({ id: subscription.id, days });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
      </div>

      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={planId} onValueChange={setPlanId}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Plans</SelectItem>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : data?.data.length ? (
        <>
          <SubscriptionsTable
            subscriptions={data.data}
            onCancel={handleCancel}
            onExtend={handleExtend}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {data.data.length} of {data.total} subscriptions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-700"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-400">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
                className="border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-400">No subscriptions found</div>
      )}
    </div>
  );
}
