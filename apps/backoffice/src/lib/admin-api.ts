import type {
  AdminUser,
  ApiKey,
  ApiKeyFilters,
  FeatureFlag,
  License,
  LicenseFilters,
  LicenseStats,
  MaintenanceMode,
  PaginatedResponse,
  Plan,
  PlatformStats,
  RevenueData,
  Subscription,
  SubscriptionFilters,
  UsageData,
  User,
  UserDetail,
  UserFilters,
} from "@/types";
import axios, { type AxiosInstance, type AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Send cookies with every request
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
          // Don't redirect if already on auth page
          if (!window.location.pathname.startsWith("/auth")) {
            window.location.href = "/auth/login";
          }
        }
        const message = error.response?.data?.message || `API error: ${error.response?.status}`;
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post<{ user: AdminUser }>("/api/v1/auth/login", {
      email,
      password,
    });

    if (data.user.role !== "admin") {
      // Clear the cookie by calling logout
      await this.logout();
      throw new Error("Access denied. Admin privileges required.");
    }

    return data;
  }

  async logout() {
    await this.client.post("/api/v1/auth/logout");
  }

  async getMe() {
    const { data } = await this.client.get<AdminUser>("/api/v1/users/me");
    return data;
  }

  // Users Management
  async getUsers(filters?: UserFilters) {
    const { data } = await this.client.get<PaginatedResponse<User>>("/api/v1/admin/users", {
      params: filters,
    });
    return data;
  }

  async getUser(id: string) {
    const { data } = await this.client.get<UserDetail>(`/api/v1/admin/users/${id}`);
    return data;
  }

  async suspendUser(id: string, reason: string) {
    const { data } = await this.client.post<User>(`/api/v1/admin/users/${id}/suspend`, { reason });
    return data;
  }

  async unsuspendUser(id: string) {
    const { data } = await this.client.post<User>(`/api/v1/admin/users/${id}/unsuspend`);
    return data;
  }

  async banUser(id: string, reason: string) {
    const { data } = await this.client.post<User>(`/api/v1/admin/users/${id}/ban`, { reason });
    return data;
  }

  async deleteUser(id: string) {
    await this.client.delete(`/api/v1/admin/users/${id}`);
  }

  // Subscriptions Management
  async getSubscriptions(filters?: SubscriptionFilters) {
    const { data } = await this.client.get<PaginatedResponse<Subscription>>(
      "/api/v1/admin/subscriptions",
      { params: filters }
    );
    return data;
  }

  async cancelSubscription(id: string, immediate = false) {
    const { data } = await this.client.post<Subscription>(
      `/api/v1/admin/subscriptions/${id}/cancel`,
      { immediate }
    );
    return data;
  }

  async extendSubscription(id: string, days: number) {
    const { data } = await this.client.post<Subscription>(
      `/api/v1/admin/subscriptions/${id}/extend`,
      { days }
    );
    return data;
  }

  // Plans Management
  async getPlans() {
    const { data } = await this.client.get<Plan[]>("/api/v1/admin/plans");
    return data;
  }

  async createPlan(planData: Omit<Plan, "id" | "subscribersCount">) {
    const { data } = await this.client.post<Plan>("/api/v1/admin/plans", planData);
    return data;
  }

  async updatePlan(id: string, planData: Partial<Plan>) {
    const { data } = await this.client.patch<Plan>(`/api/v1/admin/plans/${id}`, planData);
    return data;
  }

  async deactivatePlan(id: string) {
    const { data } = await this.client.post<Plan>(`/api/v1/admin/plans/${id}/deactivate`);
    return data;
  }

  // Licenses Management
  async getLicenses(filters?: LicenseFilters) {
    const { data } = await this.client.get<PaginatedResponse<License>>("/api/v1/admin/licenses", {
      params: filters,
    });
    return data;
  }

  async getLicenseStats() {
    const { data } = await this.client.get<LicenseStats>("/api/v1/admin/licenses/stats");
    return data;
  }

  async revokeLicense(id: string, reason: string) {
    const { data } = await this.client.post<License>(`/api/v1/admin/licenses/${id}/revoke`, {
      reason,
    });
    return data;
  }

  async extendLicense(id: string, days: number) {
    const { data } = await this.client.post<License>(`/api/v1/admin/licenses/${id}/extend`, {
      days,
    });
    return data;
  }

  async bulkExtendLicenses(ids: string[], days: number) {
    const { data } = await this.client.post<{ updated: number }>(
      "/api/v1/admin/licenses/bulk-extend",
      { ids, days }
    );
    return data;
  }

  async givePlan(userId: string, planId: string, durationDays: number) {
    const { data } = await this.client.post<License>(`/api/v1/admin/users/${userId}/give-plan`, {
      planId,
      durationDays,
    });
    return data;
  }

  // API Keys Management
  async getApiKeys(filters?: ApiKeyFilters) {
    const { data } = await this.client.get<PaginatedResponse<ApiKey>>("/api/v1/admin/api-keys", {
      params: filters,
    });
    return data;
  }

  async revokeApiKey(id: string) {
    await this.client.post(`/api/v1/admin/api-keys/${id}/revoke`);
  }

  // Platform Analytics
  async getPlatformStats() {
    const { data } = await this.client.get<PlatformStats>("/api/v1/admin/analytics/platform");
    return data;
  }

  async getRevenueData(period: "7d" | "30d" | "90d" | "1y" = "30d") {
    const { data } = await this.client.get<RevenueData[]>("/api/v1/admin/analytics/revenue", {
      params: { period },
    });
    return data;
  }

  async getUsageData(period: "7d" | "30d" | "90d" | "1y" = "30d") {
    const { data } = await this.client.get<UsageData[]>("/api/v1/admin/analytics/usage", {
      params: { period },
    });
    return data;
  }

  async getActiveBotsCount() {
    const { data } = await this.client.get<{ count: number; peak: number }>(
      "/api/v1/admin/analytics/bots-online"
    );
    return data;
  }

  // Settings
  async getFeatureFlags() {
    const { data } = await this.client.get<FeatureFlag[]>("/api/v1/admin/settings/feature-flags");
    return data;
  }

  async setFeatureFlag(id: string, enabled: boolean) {
    const { data } = await this.client.patch<FeatureFlag>(
      `/api/v1/admin/settings/feature-flags/${id}`,
      { enabled }
    );
    return data;
  }

  async getMaintenanceMode() {
    const { data } = await this.client.get<MaintenanceMode>("/api/v1/admin/settings/maintenance");
    return data;
  }

  async setMaintenanceMode(maintenanceData: MaintenanceMode) {
    const { data } = await this.client.put<MaintenanceMode>(
      "/api/v1/admin/settings/maintenance",
      maintenanceData
    );
    return data;
  }
}

export const adminApi = new AdminApiClient();
