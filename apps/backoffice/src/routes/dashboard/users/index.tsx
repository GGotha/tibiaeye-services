import { UsersTable } from "@/components/tables/users-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBanUser, useSuspendUser, useUsers } from "@/hooks/use-users";
import type { User } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/users/")({
  component: UsersPage,
});

function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({
    page,
    limit: 20,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
  });

  const suspendUser = useSuspendUser();
  const banUser = useBanUser();

  const handleSuspend = (user: User) => {
    const reason = window.prompt("Enter suspension reason:");
    if (reason) {
      suspendUser.mutate({ id: user.id, reason });
    }
  };

  const handleBan = (user: User) => {
    const reason = window.prompt("Enter ban reason:");
    if (reason && window.confirm(`Are you sure you want to ban ${user.email}?`)) {
      banUser.mutate({ id: user.id, reason });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Users</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      ) : data?.data?.length ? (
        <>
          <UsersTable users={data.data} onSuspend={handleSuspend} onBan={handleBan} />

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {data.data.length} of {data.total ?? 0} users
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
                Page {page} of {data?.totalPages ?? 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data?.totalPages ?? 1)}
                className="border-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-400">No users found</div>
      )}
    </div>
  );
}
