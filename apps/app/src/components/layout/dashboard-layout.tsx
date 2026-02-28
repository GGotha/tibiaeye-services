import { useAuth } from "@/contexts/auth-context";
import { Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-dot-pattern">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-64">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        <main key={location.pathname} className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
