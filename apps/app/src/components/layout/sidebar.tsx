import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Clock,
  DollarSign,
  GitCompareArrows,
  Key,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Characters", href: "/dashboard/characters" },
  { icon: Clock, label: "Sessions", href: "/dashboard/sessions" },
  { icon: TrendingUp, label: "Analytics", href: "/dashboard/analytics" },
  { icon: DollarSign, label: "Profit", href: "/dashboard/profit" },
  { icon: GitCompareArrows, label: "Compare", href: "/dashboard/compare" },
  { icon: MapIcon, label: "Live Map", href: "/dashboard/live-map" },
  { icon: Key, label: "License", href: "/dashboard/license" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose?.();
          }}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-200",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
              <span className="text-xl font-bold text-white">TibiaEye</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                  : location.pathname === item.href ||
                    location.pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={logout}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
