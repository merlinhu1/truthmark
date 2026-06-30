import { defaultCacheEntry } from "./cache.ts";

export function widgetValue(tenant = "default"): string {
  const entry = defaultCacheEntry(`widget:${tenant}`, "old");
  return entry.value;
}

export function widgetSummary(tenant: string): string {
  return `${tenant}:${widgetValue(tenant)}`;
}
