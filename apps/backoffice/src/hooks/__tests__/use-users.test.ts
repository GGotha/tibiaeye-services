import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

// Mock the admin-api module
vi.mock("@/lib/admin-api", () => ({
  adminApi: {
    getUsers: vi.fn(),
    getUser: vi.fn(),
    suspendUser: vi.fn(),
    unsuspendUser: vi.fn(),
    banUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

import { adminApi } from "@/lib/admin-api";
import { useUser, useUsers } from "../use-users";

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

describe("useUsers", () => {
  it("should fetch users", async () => {
    const mockUsers = {
      data: [
        {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          avatar: null,
          role: "user" as const,
          status: "active" as const,
          subscriptionStatus: "active" as const,
          charactersCount: 5,
          sessionsCount: 10,
          createdAt: "2024-01-01T00:00:00Z",
          lastLoginAt: "2024-01-15T00:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    vi.mocked(adminApi.getUsers).mockResolvedValueOnce(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(adminApi.getUsers).toHaveBeenCalledWith(undefined);
  });

  it("should fetch users with filters", async () => {
    const mockUsers = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };

    vi.mocked(adminApi.getUsers).mockResolvedValueOnce(mockUsers);

    const filters = { status: "suspended", page: 2 };

    const { result } = renderHook(() => useUsers(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(adminApi.getUsers).toHaveBeenCalledWith(filters);
  });
});

describe("useUser", () => {
  it("should fetch a single user", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      status: "active" as const,
      subscriptionStatus: "active" as const,
      role: "user" as const,
      avatar: null,
      charactersCount: 5,
      sessionsCount: 10,
      createdAt: "2024-01-01T00:00:00Z",
      lastLoginAt: "2024-01-15T00:00:00Z",
      subscription: null,
      licenses: [],
      apiKeys: [],
      recentSessions: [],
    };

    vi.mocked(adminApi.getUser).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUser("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
    expect(adminApi.getUser).toHaveBeenCalledWith("1");
  });

  it("should not fetch when id is empty", () => {
    const { result } = renderHook(() => useUser(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
  });
});
