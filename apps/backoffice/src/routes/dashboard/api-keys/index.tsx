import { ApiKeysTable } from "@/components/tables/api-keys-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys";
import type { ApiKey } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/api-keys/")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApiKeys({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
  });

  const revokeApiKey = useRevokeApiKey();

  const handleRevoke = (apiKey: ApiKey) => {
    if (window.confirm(`Are you sure you want to revoke API key "${apiKey.name}"?`)) {
      revokeApiKey.mutate(apiKey.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">API Keys</h1>
      </div>

      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : data?.data.length ? (
        <>
          <ApiKeysTable apiKeys={data.data} onRevoke={handleRevoke} />

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {data.data.length} of {data.total} API keys
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
        <div className="text-center py-8 text-slate-400">No API keys found</div>
      )}
    </div>
  );
}
