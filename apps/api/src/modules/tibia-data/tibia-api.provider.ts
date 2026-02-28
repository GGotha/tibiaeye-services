interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const CacheTTL = {
  SHORT: FIVE_MINUTES_MS,
  LONG: FIFTEEN_MINUTES_MS,
} as const;

class TibiaApiProvider {
  private cache = new Map<string, CacheEntry<unknown>>();

  async fetchWithCache<T>(url: string, ttlMs: number): Promise<T> {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TibiaAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    this.cache.set(url, { data, expiresAt: Date.now() + ttlMs });

    return data;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const tibiaApiProvider = new TibiaApiProvider();
