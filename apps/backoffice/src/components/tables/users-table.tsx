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
import type { User } from "@/types";
import { Link } from "@tanstack/react-router";
import { Ban, Eye, MoreHorizontal, Shield, UserX } from "lucide-react";

interface UsersTableProps {
  users: User[];
  onSuspend?: (user: User) => void;
  onBan?: (user: User) => void;
  onGiveLicense?: (user: User) => void;
}

function getStatusBadge(status: User["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Ativo</Badge>;
    case "suspended":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Suspenso</Badge>;
    case "banned":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Banido</Badge>;
    default:
      return null;
  }
}

function getSubscriptionBadge(status: User["subscriptionStatus"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-0">Ativa</Badge>;
    case "cancelled":
      return <Badge className="bg-slate-500/20 text-slate-400 border-0">Cancelada</Badge>;
    case "past_due":
      return <Badge className="bg-red-500/20 text-red-400 border-0">Atrasada</Badge>;
    case "none":
      return <Badge className="bg-slate-500/20 text-slate-400 border-0">Nenhuma</Badge>;
    default:
      return null;
  }
}

function UserAvatar({ name }: { name: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 shrink-0">
      {initials}
    </div>
  );
}

export function UsersTable({ users, onSuspend, onBan, onGiveLicense }: UsersTableProps) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400">Usuario</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Assinatura</TableHead>
            <TableHead className="text-slate-400">Characters</TableHead>
            <TableHead className="text-slate-400">Sessoes</TableHead>
            <TableHead className="text-slate-400">Ultimo Acesso</TableHead>
            <TableHead className="text-slate-400">Cadastro</TableHead>
            <TableHead className="text-slate-400 w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="border-slate-800/50 hover:bg-slate-800/30 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} />
                  <div>
                    <p className="font-medium text-white">{user.name || "Sem nome"}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>{getSubscriptionBadge(user.subscriptionStatus)}</TableCell>
              <TableCell className="text-slate-300">{user.charactersCount}</TableCell>
              <TableCell className="text-slate-300">{user.sessionsCount}</TableCell>
              <TableCell className="text-slate-400">
                {user.lastLoginAt ? getRelativeTime(user.lastLoginAt) : "Nunca"}
              </TableCell>
              <TableCell className="text-slate-400">{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                    <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
                      <Link to="/dashboard/users/$id" params={{ id: user.id }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </DropdownMenuItem>
                    {onGiveLicense && (
                      <DropdownMenuItem
                        onClick={() => onGiveLicense(user)}
                        className="text-slate-300 focus:bg-slate-800"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Conceder Licenca
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-800" />
                    {user.status === "active" && onSuspend && (
                      <DropdownMenuItem
                        onClick={() => onSuspend(user)}
                        className="text-yellow-400 focus:bg-slate-800 focus:text-yellow-400"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspender
                      </DropdownMenuItem>
                    )}
                    {user.status !== "banned" && onBan && (
                      <DropdownMenuItem
                        onClick={() => onBan(user)}
                        className="text-red-400 focus:bg-slate-800 focus:text-red-400"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Banir
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
