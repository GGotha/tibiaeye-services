import { LicenseStatsCard } from "@/components/cards/license-stats-card";
import { LicensesTable } from "@/components/tables/licenses-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBulkExtendLicenses,
  useExtendLicense,
  useLicenseStats,
  useLicenses,
  useRevokeLicense,
} from "@/hooks/use-licenses";
import type { License } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/licenses/")({
  component: LicensesPage,
});

function LicensesPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: stats } = useLicenseStats();
  const { data, isLoading } = useLicenses({
    page,
    limit: 20,
    status: status !== "all" ? status : undefined,
  });

  const revokeLicense = useRevokeLicense();
  const extendLicense = useExtendLicense();
  const bulkExtendLicenses = useBulkExtendLicenses();

  const handleRevoke = (license: License) => {
    const reason = window.prompt("Enter revocation reason:");
    if (reason) {
      revokeLicense.mutate({ id: license.id, reason });
    }
  };

  const handleExtend = (license: License) => {
    const daysStr = window.prompt("Enter number of days to extend:");
    const days = daysStr ? Number.parseInt(daysStr, 10) : 0;
    if (days > 0) {
      extendLicense.mutate({ id: license.id, days });
    }
  };

  const handleBulkExtend = () => {
    if (selectedIds.length === 0) return;
    const daysStr = window.prompt(`Extend ${selectedIds.length} licenses by how many days?`);
    const days = daysStr ? Number.parseInt(daysStr, 10) : 0;
    if (days > 0) {
      bulkExtendLicenses.mutate({ ids: selectedIds, days });
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data) {
      setSelectedIds(data.data.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Licenses</h1>
        {selectedIds.length > 0 && (
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleBulkExtend}>
            <Calendar className="h-4 w-4 mr-2" />
            Extend {selectedIds.length} Selected
          </Button>
        )}
      </div>

      {stats && (
        <div className="max-w-md">
          <LicenseStatsCard stats={stats} />
        </div>
      )}

      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
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
          <LicensesTable
            licenses={data.data}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onRevoke={handleRevoke}
            onExtend={handleExtend}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {data.data.length} of {data.total} licenses
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
        <div className="text-center py-8 text-slate-400">No licenses found</div>
      )}
    </div>
  );
}
