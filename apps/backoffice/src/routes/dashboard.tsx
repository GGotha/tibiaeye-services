import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: AdminDashboardLayout,
});
