import { useAdminAuth } from "@/contexts/admin-auth-context";
import { Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminDashboardLayout() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-dot-pattern">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
