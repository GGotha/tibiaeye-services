import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

// Mock the admin-api module
vi.mock("@/lib/admin-api", () => ({
  adminApi: {
    getPlatformStats: vi.fn(),
    getRevenueData: vi.fn(),
    getUsageData: vi.fn(),
    getActiveBotsCount: vi.fn(),
  },
}));

import { adminApi } from "@/lib/admin-api";
import { useActiveBotsCount, usePlatformStats, useRevenueData } from "../use-platform-analytics";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe("usePlatformStats", () => {
  it("should fetch platform stats", async () => {
    const mockStats = {
      users: {
        total: 1000,
        activeToday: 150,
        newThisWeek: 50,
        newThisMonth: 200,
        growthRate: 5.5,
      },
      subscriptions: {
        total: 500,
        mrr: 25000,
        mrrGrowth: 3.2,
        churnRate: 2.1,
        activeTrials: 25,
      },
      licenses: {
        total: 800,
        active: 750,
        expiringThisWeek: 15,
      },
      usage: {
        sessionsToday: 450,
        apiRequestsToday: 125000,
        avgSessionDuration: 3600,
        peakConcurrentBots: 85,
      },
    };

    vi.mocked(adminApi.getPlatformStats).mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => usePlatformStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(adminApi.getPlatformStats).toHaveBeenCalled();
  });
});

describe("useRevenueData", () => {
  it("should fetch revenue data with default period", async () => {
    const mockRevenueData = [
      { date: "2024-01-01", mrr: 24000, newSubscriptions: 10, churn: 2 },
      { date: "2024-01-02", mrr: 24500, newSubscriptions: 8, churn: 1 },
    ];

    vi.mocked(adminApi.getRevenueData).mockResolvedValueOnce(mockRevenueData);

    const { result } = renderHook(() => useRevenueData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRevenueData);
    expect(adminApi.getRevenueData).toHaveBeenCalledWith("30d");
  });

  it("should fetch revenue data with custom period", async () => {
    const mockRevenueData = [{ date: "2024-01-01", mrr: 24000, newSubscriptions: 10, churn: 2 }];

    vi.mocked(adminApi.getRevenueData).mockResolvedValueOnce(mockRevenueData);

    const { result } = renderHook(() => useRevenueData("7d"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminApi.getRevenueData).toHaveBeenCalledWith("7d");
  });
});

describe("useActiveBotsCount", () => {
  it("should fetch active bots count", async () => {
    const mockBotsData = { count: 42, peak: 85 };

    vi.mocked(adminApi.getActiveBotsCount).mockResolvedValueOnce(mockBotsData);

    const { result } = renderHook(() => useActiveBotsCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockBotsData);
    expect(adminApi.getActiveBotsCount).toHaveBeenCalled();
  });
});
