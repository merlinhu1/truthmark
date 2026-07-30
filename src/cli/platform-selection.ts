import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";

import {
  SUPPORTED_PLATFORMS,
  type TruthmarkPlatform,
} from "../config/schema.js";

const PLATFORM_LABELS: Record<TruthmarkPlatform, string> = {
  codex: "Codex",
  opencode: "OpenCode",
  "claude-code": "Claude Code",
  "github-copilot": "GitHub Copilot",
  antigravity: "Antigravity",
  cursor: "Cursor",
};

const normalizePlatforms = (
  platforms: readonly TruthmarkPlatform[],
): TruthmarkPlatform[] => {
  const selected = new Set(platforms);
  return SUPPORTED_PLATFORMS.filter((platform) => selected.has(platform));
};

export const renderPlatformChoices = (
  defaults: readonly TruthmarkPlatform[],
): string => {
  const selected = new Set(defaults);
  return SUPPORTED_PLATFORMS.map(
    (platform, index) =>
      `${index + 1}. ${PLATFORM_LABELS[platform]} [${platform}]${selected.has(platform) ? " (selected)" : ""}`,
  ).join("\n");
};

export const parsePlatformSelection = (
  input: string,
  defaults: readonly TruthmarkPlatform[],
): TruthmarkPlatform[] | null => {
  const value = input.trim().toLowerCase();
  if (value === "") return normalizePlatforms(defaults);
  if (value === "q" || value === "quit") return null;
  if (value === "none") return [];

  const selected = value.split(",").map((token) => {
    const index = Number(token.trim());
    if (!Number.isInteger(index) || index < 1 || index > SUPPORTED_PLATFORMS.length)
      throw new Error(`Unsupported platform choice: ${token.trim()}`);
    return SUPPORTED_PLATFORMS[index - 1];
  });
  return normalizePlatforms(selected);
};

export const promptForPlatforms = async (options: {
  defaults: readonly TruthmarkPlatform[];
  input: Readable;
  output: Writable;
}): Promise<TruthmarkPlatform[] | null> => {
  options.output.write(`${renderPlatformChoices(options.defaults)}\n`);
  const readline = createInterface({ input: options.input, output: options.output });
  try {
    for (;;) {
      const answer = await readline.question(
        "Select platforms by number (comma-separated), 'none' for CLI-only, or 'q' to cancel: ",
      );
      try {
        return parsePlatformSelection(answer, options.defaults);
      } catch (error: unknown) {
        options.output.write(
          `${error instanceof Error ? error.message : String(error)}\n`,
        );
      }
    }
  } finally {
    readline.close();
  }
};
