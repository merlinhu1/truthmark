export type CacheEntry = {
  key: string;
  value: string;
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds: number;
};

export function defaultCacheEntry(key: string, value: string): CacheEntry {
  return {
    key,
    value,
    maxAgeSeconds: 60,
    staleWhileRevalidateSeconds: 30,
  };
}

export function isFresh(entry: CacheEntry, ageSeconds: number): boolean {
  return ageSeconds <= entry.maxAgeSeconds;
}
