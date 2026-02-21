import { useAdminAuth } from "@/contexts/admin-auth-context";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ToggleRight,
  Users,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: CreditCard, label: "Subscriptions", href: "/dashboard/subscriptions" },
  { icon: Shield, label: "Licenses", href: "/dashboard/licenses" },
  { icon: Key, label: "API Keys", href: "/dashboard/api-keys" },
  { icon: Activity, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAdminAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
            <ToggleRight className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TibiaEye Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
                : location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-500/10 text-red-400"
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
  );
}
