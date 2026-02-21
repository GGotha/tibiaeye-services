import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getRelativeTime } from "@/lib/utils";
import type { License } from "@/types";
import { Link } from "@tanstack/react-router";
import { Calendar, Eye, MoreHorizontal, XCircle } from "lucide-react";

interface LicensesTableProps {
  licenses: License[];
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onRevoke?: (license: License) => void;
  onExtend?: (license: License) => void;
}

function getStatusBadge(status: License["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>;
    case "expired":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Expired</Badge>;
    case "revoked":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Revoked</Badge>;
    default:
      return null;
  }
}

export function LicensesTable({
  licenses,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onRevoke,
  onExtend,
}: LicensesTableProps) {
  const allSelected = licenses.length > 0 && selectedIds.length === licenses.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < licenses.length;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-800 hover:bg-transparent">
          {onSelectAll && (
            <TableHead className="w-[50px]">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500"
              />
            </TableHead>
          )}
          <TableHead className="text-slate-400">User</TableHead>
          <TableHead className="text-slate-400">Key Prefix</TableHead>
          <TableHead className="text-slate-400">Status</TableHead>
          <TableHead className="text-slate-400">Activations</TableHead>
          <TableHead className="text-slate-400">Expires</TableHead>
          <TableHead className="text-slate-400">Last Used</TableHead>
          <TableHead className="text-slate-400 w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {licenses.map((license) => (
          <TableRow key={license.id} className="border-slate-800 hover:bg-slate-800/50">
            {onSelect && (
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(license.id)}
                  onChange={(e) => onSelect(license.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-red-500 focus:ring-red-500"
                />
              </TableCell>
            )}
            <TableCell>
              <div>
                <p className="font-medium text-white">{license.userName || "Unnamed"}</p>
                <p className="text-sm text-slate-400">{license.userEmail}</p>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded">
                {license.keyPrefix}...
              </code>
            </TableCell>
            <TableCell>{getStatusBadge(license.status)}</TableCell>
            <TableCell className="text-slate-300">
              {license.activationsCount}/{license.maxActivations}
            </TableCell>
            <TableCell className="text-slate-400">{formatDate(license.expiresAt)}</TableCell>
            <TableCell className="text-slate-400">
              {license.lastUsedAt ? getRelativeTime(license.lastUsedAt) : "Never"}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                  <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
                    <Link to="/dashboard/users/$id" params={{ id: license.userId }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View User
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  {license.status !== "revoked" && onExtend && (
                    <DropdownMenuItem
                      onClick={() => onExtend(license)}
                      className="text-slate-300 focus:bg-slate-800"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Extend License
                    </DropdownMenuItem>
                  )}
                  {license.status === "active" && onRevoke && (
                    <DropdownMenuItem
                      onClick={() => onRevoke(license)}
                      className="text-red-400 focus:bg-slate-800 focus:text-red-400"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Revoke License
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
