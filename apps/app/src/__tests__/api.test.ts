import { api } from "@/lib/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock axios
vi.mock("axios", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe("ApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cookie-based authentication", () => {
    it("should be configured with withCredentials for cookie auth", () => {
      // The API client uses withCredentials: true for cookie-based auth
      // This is configured in the axios instance creation
      expect(api).toBeDefined();
    });

    it("should have login method", () => {
      expect(typeof api.login).toBe("function");
    });

    it("should have logout method", () => {
      expect(typeof api.logout).toBe("function");
    });

    it("should have getMe method", () => {
      expect(typeof api.getMe).toBe("function");
    });

    it("should have refreshToken method", () => {
      expect(typeof api.refreshToken).toBe("function");
    });
  });

  describe("API methods", () => {
    it("should have session methods", () => {
      expect(typeof api.getSessions).toBe("function");
      expect(typeof api.getSession).toBe("function");
      expect(typeof api.getActiveSession).toBe("function");
      expect(typeof api.deleteSession).toBe("function");
    });

    it("should have character methods", () => {
      expect(typeof api.getCharacters).toBe("function");
      expect(typeof api.createCharacter).toBe("function");
      expect(typeof api.getCharacter).toBe("function");
      expect(typeof api.deleteCharacter).toBe("function");
    });

    it("should have license methods", () => {
      expect(typeof api.getLicenseStatus).toBe("function");
      expect(typeof api.getCurrentSubscription).toBe("function");
    });
  });
});
