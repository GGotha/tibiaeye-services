import type {
  Character,
  CharacterWithStatus,
  CompareData,
  ExperienceHourly,
  GameEvent,
  KillsByCreature,
  LicenseStatus,
  LootSummary,
  PaginatedResponse,
  ProfitData,
  Session,
  SessionDetail,
  SessionFilters,
  Subscription,
  User,
} from "@/types";
import axios, { type AxiosInstance, type AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface ApiErrorResponse {
  message?: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Send cookies with every request
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Don't redirect if already on auth page
          if (!window.location.pathname.startsWith("/auth")) {
            window.location.href = "/auth/login";
          }
        }
        const message = error.response?.data?.message || error.message || "API error";
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.axiosInstance.post<{ user: User }>("/api/v1/auth/login", {
      email,
      password,
    });
    return data;
  }

  async register(registerData: { email: string; password: string; name?: string }) {
    const { data } = await this.axiosInstance.post<{ user: User; licenseKey?: string | null }>(
      "/api/v1/auth/register",
      registerData
    );
    return data;
  }

  async logout() {
    await this.axiosInstance.post("/api/v1/auth/logout");
  }

  async refreshToken() {
    const { data } = await this.axiosInstance.post<{ user: User }>("/api/v1/auth/refresh");
    return data;
  }

  async forgotPassword(email: string) {
    const { data } = await this.axiosInstance.post("/api/v1/auth/forgot-password", { email });
    return data;
  }

  async getMe() {
    const { data } = await this.axiosInstance.get<User>("/api/v1/users/me");
    return data;
  }

  async updateMe(updateData: Partial<User>) {
    const { data } = await this.axiosInstance.patch<User>("/api/v1/users/me", updateData);
    return data;
  }

  async updatePassword(passwordData: { currentPassword: string; newPassword: string }) {
    const { data } = await this.axiosInstance.patch("/api/v1/users/me/password", passwordData);
    return data;
  }

  // Sessions
  async getSessions(params?: SessionFilters) {
    const { data } = await this.axiosInstance.get<PaginatedResponse<Session>>("/api/v1/sessions", {
      params,
    });
    return data;
  }

  async getSession(id: string) {
    const { data } = await this.axiosInstance.get<SessionDetail>(`/api/v1/sessions/${id}`);
    return data;
  }

  async getActiveSession() {
    const { data } = await this.axiosInstance.get<Session | null>("/api/v1/sessions/active");
    return data;
  }

  async deleteSession(id: string) {
    const { data } = await this.axiosInstance.delete(`/api/v1/sessions/${id}`);
    return data;
  }

  // Analytics
  async getExperienceHourly(sessionId: string) {
    const { data } = await this.axiosInstance.get<ExperienceHourly>(
      "/api/v1/analytics/experience/hourly",
      { params: { sessionId } }
    );
    return data;
  }

  async getKillsByCreature(sessionId?: string) {
    const { data } = await this.axiosInstance.get<KillsByCreature[]>(
      "/api/v1/analytics/kills/by-creature",
      { params: sessionId ? { sessionId } : undefined }
    );
    return data;
  }

  async getLootSummary(sessionId?: string) {
    const { data } = await this.axiosInstance.get<LootSummary>("/api/v1/analytics/loot/summary", {
      params: sessionId ? { sessionId } : undefined,
    });
    return data;
  }

  async getGameEvents(sessionId?: string): Promise<GameEvent[]> {
    const params: Record<string, string> = {};
    if (sessionId) params.sessionId = sessionId;
    const { data } = await this.axiosInstance.get<GameEvent[]>("/api/v1/analytics/events", {
      params,
    });
    return data;
  }

  async getProfit(params?: {
    sessionId?: string;
    characterId?: string;
    days?: number;
  }): Promise<ProfitData> {
    const { data } = await this.axiosInstance.get<ProfitData>("/api/v1/analytics/profit", {
      params,
    });
    return data;
  }

  async compareSessions(sessionIds: string[]): Promise<CompareData> {
    const { data } = await this.axiosInstance.get<CompareData>("/api/v1/analytics/compare", {
      params: { sessionIds: sessionIds.join(",") },
    });
    return data;
  }

  // Characters
  async getCharacters() {
    const { data } = await this.axiosInstance.get<CharacterWithStatus[]>("/api/v1/characters");
    return data;
  }

  async createCharacter(characterData: { name: string }) {
    const { data } = await this.axiosInstance.post<Character>("/api/v1/characters", characterData);
    return data;
  }

  async getCharacter(id: string) {
    const { data } = await this.axiosInstance.get<CharacterWithStatus>(`/api/v1/characters/${id}`);
    return data;
  }

  async deleteCharacter(id: string) {
    const { data } = await this.axiosInstance.delete(`/api/v1/characters/${id}`);
    return data;
  }

  async getCharacterSessions(id: string, params?: { page?: number; limit?: number }) {
    const { data } = await this.axiosInstance.get<PaginatedResponse<Session>>(
      `/api/v1/characters/${id}/sessions`,
      { params }
    );
    return data;
  }

  // License
  async getLicenseStatus() {
    const { data } = await this.axiosInstance.get<LicenseStatus | null>("/api/v1/license");
    return data;
  }

  async regenerateLicenseKey() {
    const { data } = await this.axiosInstance.post<{ licenseKey: string }>(
      "/api/v1/license/regenerate"
    );
    return data;
  }

  // Subscription
  async getCurrentSubscription() {
    const { data } = await this.axiosInstance.get<Subscription>("/api/v1/subscriptions/current");
    return data;
  }

  async cancelSubscription() {
    const { data } = await this.axiosInstance.post("/api/v1/subscriptions/cancel");
    return data;
  }

  // Dashboard
  async getDashboardStats() {
    const { data } = await this.axiosInstance.get<{
      xpPerHour: number;
      killsToday: number;
      lootValueToday: number;
      onlineTimeToday: number;
    }>("/api/v1/dashboard/stats");
    return data;
  }
}

export const api = new ApiClient();
