import { defaultCacheEntry } from "./cache.ts";
import { cacheHitMetric } from "./metrics.ts";

export function readWidgetForTenant(tenant: string): string {
  const entry = defaultCacheEntry(`widget:${tenant}`, "old");
  const metric = cacheHitMetric(tenant);
  return `${entry.value}:${metric.tags.tenant}`;
}
