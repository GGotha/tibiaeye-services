import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Clock,
  DollarSign,
  GitCompareArrows,
  Globe,
  Key,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const navGroups = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Users, label: "Characters", href: "/dashboard/characters" },
      { icon: Clock, label: "Sessions", href: "/dashboard/sessions" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { icon: TrendingUp, label: "Analytics", href: "/dashboard/analytics" },
      { icon: DollarSign, label: "Profit", href: "/dashboard/profit" },
      { icon: GitCompareArrows, label: "Compare", href: "/dashboard/compare" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: Globe, label: "World", href: "/dashboard/world" },
      { icon: Route, label: "Routes", href: "/dashboard/routes" },
      { icon: Key, label: "License", href: "/dashboard/license" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  },
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 animate-pulse-glow flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z" fill="rgba(0,0,0,0.3)" stroke="#0f172a" strokeWidth="1.5"/>
                  <circle cx="12" cy="12.5" r="4" fill="#0f172a"/>
                  <circle cx="12" cy="12.5" r="2" fill="#10b981"/>
                  <circle cx="13" cy="11.5" r="0.8" fill="white" opacity="0.8"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">TibiaEye</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-600">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
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
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-l-[3px] border-emerald-400"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1"
                        )}
                      >
                        <item.icon className={cn("h-5 w-5", isActive && "text-emerald-400")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
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
