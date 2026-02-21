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
import { Link } from "@tanstack/react-router";
import { Bell, Shield, User } from "lucide-react";

export function AdminHeader() {
  const { user, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-red-400" />
        <span className="text-sm text-slate-400">Admin Panel</span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <Bell className="h-5 w-5" />
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
              <span className="text-sm font-medium">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-400">Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
              <Link to="/dashboard/settings/features">Feature Flags</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 focus:bg-slate-800 focus:text-red-400"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
