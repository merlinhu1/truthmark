import { createHash } from "node:crypto";

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

export const hashText = (value: string): string => {
  return createHash("sha256").update(value, "utf8").digest("hex");
};

export const hashJsonLike = (value: unknown): string => {
  return hashText(JSON.stringify(toStableValue(value)));
};