import { cache } from "./cache.js";

export function invalidateCache(type: string, key?: string): void {
  if (key) {
    const cacheKey = `${type}${key}`;
    cache.delete(cacheKey);
  } else {
    cache.deleteByPrefix(type);
  }
}

export function clearCache(): void {
  cache.clear();
}
