import type {
  BotConfig,
  BotConfigResponse,
  BotRoute,
  Character,
  CharacterWithStatus,
  CompareData,
  CreateDiscordIntegrationInput,
  DiscordIntegration,
  ExperienceHourly,
  GameEvent,
  HuntAnalytics,
  KillsByCreature,
  KillsHeatmapPoint,
  LicenseStatus,
  LootSummary,
  PaginatedResponse,
  PositionHeatmapPoint,
  PositionLog,
  ProfitData,
  RouteSegmentAnalytics,
  RouteSuggestions,
  RouteWaypoint,
  Session,
  SessionDetail,
  SessionFilters,
  Subscription,
  TimelineResponse,
  UpdateDiscordIntegrationInput,
  User,
} from "@/types";
import type {
  BoostedCreatures,
  KillStatistics,
  RashidLocation,
  TibiaCharacterInfo,
  TibiaWorldInfo,
  TibiaWorldsOverview,
} from "@/types/tibia";
import axios, { type AxiosInstance, type AxiosError } from "axios";

function resolveApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return `http://${window.location.hostname}:4000`;

  try {
    const parsed = new URL(envUrl);
    if (parsed.hostname === "localhost" && window.location.hostname !== "localhost") {
      return `http://${window.location.hostname}:${parsed.port || "4000"}`;
    }
    return envUrl;
  } catch {
    return envUrl;
  }
}

const API_URL = resolveApiUrl();

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

  async getActiveSessions() {
    const { data } = await this.axiosInstance.get<Session[]>("/api/v1/sessions/active");
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

  async getKillsHeatmap(sessionId?: string, startDate?: string): Promise<KillsHeatmapPoint[]> {
    const params: Record<string, string> = {};
    if (sessionId) params.sessionId = sessionId;
    if (startDate) params.startDate = startDate;
    const { data } = await this.axiosInstance.get<KillsHeatmapPoint[]>(
      "/api/v1/analytics/kills/heatmap",
      { params: Object.keys(params).length > 0 ? params : undefined }
    );
    return data;
  }

  async getSessionPositions(
    sessionId: string,
    params?: { limit?: number }
  ): Promise<PositionLog[]> {
    const { data } = await this.axiosInstance.get<PositionLog[]>(
      `/api/v1/sessions/${sessionId}/positions`,
      { params }
    );
    return data;
  }

  async getPositionHeatmap(sessionId: string, startDate?: string): Promise<PositionHeatmapPoint[]> {
    const params: Record<string, string> = { sessionId };
    if (startDate) params.startDate = startDate;
    const { data } = await this.axiosInstance.get<PositionHeatmapPoint[]>(
      "/api/v1/analytics/positions/heatmap",
      { params }
    );
    return data;
  }

  async getHuntAnalytics(): Promise<HuntAnalytics[]> {
    const { data } = await this.axiosInstance.get<HuntAnalytics[]>("/api/v1/analytics/hunts");
    return data;
  }

  async getRouteSegments(routeId: string): Promise<RouteSegmentAnalytics> {
    const { data } = await this.axiosInstance.get<RouteSegmentAnalytics>(
      "/api/v1/analytics/route-segments",
      { params: { routeId } }
    );
    return data;
  }

  async getRouteSuggestions(routeId: string): Promise<RouteSuggestions> {
    const { data } = await this.axiosInstance.post<RouteSuggestions>(
      "/api/v1/analytics/route-suggestions",
      { routeId }
    );
    return data;
  }

  async getTimeline(
    sessionId: string,
    params?: { limit?: number; cursor?: string }
  ): Promise<TimelineResponse> {
    const { data } = await this.axiosInstance.get<TimelineResponse>("/api/v1/analytics/timeline", {
      params: { sessionId, ...params },
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

  // Discord
  async getDiscordIntegrations() {
    const { data } = await this.axiosInstance.get<DiscordIntegration[]>("/api/v1/discord");
    return data;
  }

  async createDiscordIntegration(input: CreateDiscordIntegrationInput) {
    const { data } = await this.axiosInstance.post<DiscordIntegration>("/api/v1/discord", input);
    return data;
  }

  async updateDiscordIntegration(id: string, input: UpdateDiscordIntegrationInput) {
    const { data } = await this.axiosInstance.patch<DiscordIntegration>(
      `/api/v1/discord/${id}`,
      input
    );
    return data;
  }

  async deleteDiscordIntegration(id: string) {
    await this.axiosInstance.delete(`/api/v1/discord/${id}`);
  }

  async testDiscordIntegration(id: string) {
    const { data } = await this.axiosInstance.post<{ success: boolean }>(
      `/api/v1/discord/${id}/test`
    );
    return data;
  }

  // Routes
  async getRoutes() {
    const { data } = await this.axiosInstance.get<BotRoute[]>("/api/v1/routes");
    return data;
  }

  async getRoute(id: string) {
    const { data } = await this.axiosInstance.get<BotRoute>(`/api/v1/routes/${id}`);
    return data;
  }

  async createRoute(input: { name: string; description?: string; waypoints?: RouteWaypoint[] }) {
    const { data } = await this.axiosInstance.post<BotRoute>("/api/v1/routes", input);
    return data;
  }

  async updateRoute(id: string, input: Partial<{ name: string; description: string | null; waypoints: RouteWaypoint[]; isPublic: boolean }>) {
    const { data } = await this.axiosInstance.put<BotRoute>(`/api/v1/routes/${id}`, input);
    return data;
  }

  async deleteRoute(id: string) {
    await this.axiosInstance.delete(`/api/v1/routes/${id}`);
  }

  async exportRoute(id: string) {
    const { data } = await this.axiosInstance.get<{ name: string; waypoints: RouteWaypoint[]; metadata: Record<string, unknown> | null }>(`/api/v1/routes/${id}/export`);
    return data;
  }

  async importRoute(input: { name: string; waypoints: RouteWaypoint[]; metadata?: Record<string, unknown> }) {
    const { data } = await this.axiosInstance.post<BotRoute>("/api/v1/routes/import", input);
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

  // TibiaData
  async getTibiaCharacter(name: string) {
    const { data } = await this.axiosInstance.get<TibiaCharacterInfo>(
      `/api/v1/tibia-data/character/${encodeURIComponent(name)}`
    );
    return data;
  }

  async getTibiaWorld(name: string) {
    const { data } = await this.axiosInstance.get<TibiaWorldInfo>(
      `/api/v1/tibia-data/world/${encodeURIComponent(name)}`
    );
    return data;
  }

  async getTibiaWorlds() {
    const { data } = await this.axiosInstance.get<TibiaWorldsOverview>("/api/v1/tibia-data/worlds");
    return data;
  }

  async getBoostedCreatures() {
    const { data } = await this.axiosInstance.get<BoostedCreatures>("/api/v1/tibia-data/boosted");
    return data;
  }

  async getRashidLocation() {
    const { data } = await this.axiosInstance.get<RashidLocation>("/api/v1/tibia-data/rashid");
    return data;
  }

  async getKillStatistics(world: string) {
    const { data } = await this.axiosInstance.get<KillStatistics>(
      `/api/v1/tibia-data/killstatistics/${encodeURIComponent(world)}`
    );
    return data;
  }

  // Bot Config
  async getBotConfig(characterId: string) {
    const { data } = await this.axiosInstance.get<BotConfigResponse>(
      `/api/v1/characters/${characterId}/config`
    );
    return data;
  }

  async updateBotConfig(characterId: string, config: BotConfig) {
    const { data } = await this.axiosInstance.put<BotConfigResponse>(
      `/api/v1/characters/${characterId}/config`,
      { config }
    );
    return data;
  }

  async patchBotConfig(characterId: string, config: Partial<BotConfig>) {
    const { data } = await this.axiosInstance.patch<BotConfigResponse>(
      `/api/v1/characters/${characterId}/config`,
      { config }
    );
    return data;
  }
}

export const api = new ApiClient();
