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
import { formatCurrencyPrecise, formatDate } from "@/lib/utils";
import type { Subscription } from "@/types";
import { Link } from "@tanstack/react-router";
import { Calendar, Eye, MoreHorizontal, XCircle } from "lucide-react";

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onCancel?: (subscription: Subscription) => void;
  onExtend?: (subscription: Subscription) => void;
}

function getStatusBadge(status: Subscription["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Active</Badge>;
    case "cancelled":
      return <Badge className="bg-slate-500/20 text-slate-400 border-0">Cancelled</Badge>;
    case "past_due":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Past Due</Badge>;
    case "trialing":
      return <Badge className="bg-blue-500/20 text-blue-400 border-0">Trial</Badge>;
    default:
      return null;
  }
}

export function SubscriptionsTable({ subscriptions, onCancel, onExtend }: SubscriptionsTableProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">User</TableHead>
            <TableHead className="text-slate-400">Plan</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Price</TableHead>
            <TableHead className="text-slate-400">Period End</TableHead>
            <TableHead className="text-slate-400">Created</TableHead>
            <TableHead className="text-slate-400 w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow
              key={subscription.id}
              className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-white">{subscription.userName || "Unnamed"}</p>
                  <p className="text-sm text-slate-400">{subscription.userEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-300">{subscription.plan.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(subscription.status)}
                  {subscription.cancelAtPeriodEnd && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Canceling</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-slate-300">
                {formatCurrencyPrecise(subscription.plan.price)}/{subscription.plan.interval}
              </TableCell>
              <TableCell className="text-slate-400">
                {formatDate(subscription.currentPeriodEnd)}
              </TableCell>
              <TableCell className="text-slate-400">{formatDate(subscription.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
                      <Link to="/dashboard/users/$id" params={{ id: subscription.userId }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View User
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    {subscription.status === "active" && onExtend && (
                      <DropdownMenuItem
                        onClick={() => onExtend(subscription)}
                        className="text-slate-300 focus:bg-slate-800"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Extend Period
                      </DropdownMenuItem>
                    )}
                    {subscription.status === "active" &&
                      !subscription.cancelAtPeriodEnd &&
                      onCancel && (
                        <DropdownMenuItem
                          onClick={() => onCancel(subscription)}
                          className="text-red-400 focus:bg-slate-800 focus:text-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Subscription
                        </DropdownMenuItem>
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
