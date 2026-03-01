import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, User } from "lucide-react";

interface AdminHeaderProps {
  onOpenSidebar?: () => void;
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.replace("/dashboard", "").replace(/^\//, "");
    if (!path) return null;

    const labelMap: Record<string, string> = {
      users: "Usuarios",
      licenses: "Licencas",
      subscriptions: "Assinaturas",
      "api-keys": "API Keys",
      analytics: "Analytics",
      settings: "Configuracoes",
    };

    const segments = path.split("/");
    const first = segments[0];
    return labelMap[first] || first.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md px-6 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-slate-500">Painel</span>
          {breadcrumb && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-slate-300">{breadcrumb}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-950" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-slate-400 hover:text-white"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Admin"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-400">Conta Admin</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
              <Link to="/dashboard/settings/features">Feature Flags</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 focus:bg-slate-800 focus:text-red-400"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
