import type { CommandResult, Diagnostic } from "./diagnostic.js";

const formatContext = (diagnostic: Diagnostic): string => {
  const parts: string[] = [];

  if (diagnostic.file) {
    parts.push(`file: ${diagnostic.file}`);
  }

  if (diagnostic.area) {
    parts.push(`area: ${diagnostic.area}`);
  }

  return parts.length > 0 ? ` (${parts.join(", ")})` : "";
};

const toStableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => toStableValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((stable, key) => {
        stable[key] = toStableValue((value as Record<string, unknown>)[key]);
        return stable;
      }, {});
  }

  return value;
};

export const renderHuman = (result: CommandResult): string => {
  const lines = [`truthmark ${result.command}`, result.summary];

  if (result.diagnostics.length > 0) {
    lines.push("");
  }

  for (const diagnostic of result.diagnostics) {
    lines.push(
      `[${diagnostic.severity.toUpperCase()}] ${diagnostic.category}: ${diagnostic.message}${formatContext(diagnostic)}`,
    );
  }

  return lines.join("\n");
};

export const renderJson = (result: CommandResult): string => {
  return JSON.stringify(toStableValue(result), null, 2);
};