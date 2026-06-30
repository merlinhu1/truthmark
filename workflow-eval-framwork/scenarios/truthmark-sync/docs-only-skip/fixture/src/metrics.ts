export type WidgetMetric = {
  name: string;
  value: number;
  tags: Record<string, string>;
};

export function cacheHitMetric(tenant: string): WidgetMetric {
  return {
    name: "widget.cache.hit",
    value: 1,
    tags: { tenant },
  };
}
