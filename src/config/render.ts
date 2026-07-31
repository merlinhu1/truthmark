import { parse, parseDocument, stringify } from "yaml";

import { createDefaultRawConfig } from "./defaults.js";
import {
  SUPPORTED_PLATFORMS,
  type RawTruthmarkConfig,
  type TruthmarkPlatform,
} from "./schema.js";

const normalizePlatforms = (
  platforms: readonly TruthmarkPlatform[],
): TruthmarkPlatform[] => {
  const selected = new Set(platforms);
  return SUPPORTED_PLATFORMS.filter((platform) => selected.has(platform));
};

export const renderConfig = (
  platforms: readonly TruthmarkPlatform[] = [],
): string => {
  const normalized = normalizePlatforms(platforms);
  const config: RawTruthmarkConfig = createDefaultRawConfig();
  if (normalized.length > 0) config.platforms = normalized;
  return stringify(config);
};

export const updateConfigPlatforms = (
  source: string,
  platforms: readonly TruthmarkPlatform[],
): string => {
  const normalized = normalizePlatforms(platforms);
  const parsed = parse(source) as RawTruthmarkConfig;
  if (
    JSON.stringify(normalizePlatforms(parsed.platforms ?? [])) ===
    JSON.stringify(normalized)
  )
    return source;

  const document = parseDocument(source);
  if (normalized.length === 0) document.delete("platforms");
  else document.set("platforms", normalized);
  return document.toString();
};
