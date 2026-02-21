import { useCharacters } from "@/hooks/use-characters";
import { useSession, useSessions } from "@/hooks/use-sessions";
import { api } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    getSessions: vi.fn(),
    getSession: vi.fn(),
    getCharacters: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches sessions successfully", async () => {
    const mockSessions = {
      data: [
        { id: "1", characterName: "Test", status: "completed" },
        { id: "2", characterName: "Test2", status: "active" },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (api.getSessions as ReturnType<typeof vi.fn>).mockResolvedValue(mockSessions);

    const { result } = renderHook(() => useSessions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSessions);
    expect(api.getSessions).toHaveBeenCalledWith(undefined);
  });

  it("passes filters to API", async () => {
    const filters = { characterName: "Test", status: "completed" };
    (api.getSessions as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [], total: 0 });

    const { result } = renderHook(() => useSessions(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.getSessions).toHaveBeenCalledWith(filters);
  });
});

describe("useSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches single session", async () => {
    const mockSession = {
      id: "1",
      characterName: "Test",
      status: "completed",
      kills: [],
      loot: [],
    };

    (api.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);

    const { result } = renderHook(() => useSession("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSession);
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useSession(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(api.getSession).not.toHaveBeenCalled();
  });
});

describe("useCharacters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches characters successfully", async () => {
    const mockCharacters = [
      { id: "1", name: "Char1", world: "Antica", hasActiveSession: false },
      { id: "2", name: "Char2", world: "Secura", hasActiveSession: true },
    ];

    (api.getCharacters as ReturnType<typeof vi.fn>).mockResolvedValue(mockCharacters);

    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCharacters);
  });
});
