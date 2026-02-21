import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});
