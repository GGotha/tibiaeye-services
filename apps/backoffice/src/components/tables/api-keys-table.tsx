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
import { formatDate, formatNumber, getRelativeTime } from "@/lib/utils";
import type { ApiKey } from "@/types";
import { Link } from "@tanstack/react-router";
import { Eye, MoreHorizontal, XCircle } from "lucide-react";

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  onRevoke?: (apiKey: ApiKey) => void;
}

function getStatusBadge(status: ApiKey["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>;
    case "revoked":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Revoked</Badge>;
    default:
      return null;
  }
}

export function ApiKeysTable({ apiKeys, onRevoke }: ApiKeysTableProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Name</TableHead>
            <TableHead className="text-slate-400">User</TableHead>
            <TableHead className="text-slate-400">Key Prefix</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Requests</TableHead>
            <TableHead className="text-slate-400">Last Used</TableHead>
            <TableHead className="text-slate-400">Created</TableHead>
            <TableHead className="text-slate-400 w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => (
            <TableRow
              key={apiKey.id}
              className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
            >
              <TableCell className="font-medium text-white">{apiKey.name}</TableCell>
              <TableCell className="text-slate-400">{apiKey.userEmail}</TableCell>
              <TableCell>
                <code className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded">
                  {apiKey.keyPrefix}...
                </code>
              </TableCell>
              <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
              <TableCell className="text-slate-300">{formatNumber(apiKey.requestsCount)}</TableCell>
              <TableCell className="text-slate-400">
                {apiKey.lastUsedAt ? getRelativeTime(apiKey.lastUsedAt) : "Never"}
              </TableCell>
              <TableCell className="text-slate-400">{formatDate(apiKey.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
                      <Link to="/dashboard/users/$id" params={{ id: apiKey.userId }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View User
                      </Link>
                    </DropdownMenuItem>
                    {apiKey.status === "active" && onRevoke && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-800" />
                        <DropdownMenuItem
                          onClick={() => onRevoke(apiKey)}
                          className="text-red-400 focus:bg-slate-800 focus:text-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Revoke Key
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
