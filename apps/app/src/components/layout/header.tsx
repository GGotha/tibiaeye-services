import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@tanstack/react-router";
import { Bell, Menu, User } from "lucide-react";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="md:hidden text-slate-400 hover:text-white"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="hidden md:block" />

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
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
            <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
              <Link to="/dashboard/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800">
              <Link to="/dashboard/license">License</Link>
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
