import { strict as assert } from "node:assert";
import { test } from "node:test";

import { defaultCacheEntry, isFresh } from "../src/cache.ts";
import { readWidgetForTenant } from "../src/api.ts";

test("cache entries use the documented default freshness window", () => {
  const entry = defaultCacheEntry("widget:acme", "old");
  assert.equal(entry.maxAgeSeconds, 60);
  assert.equal(isFresh(entry, 45), true);
});

test("tenant reads include the tenant marker", () => {
  assert.equal(readWidgetForTenant("acme"), "old:acme");
});
