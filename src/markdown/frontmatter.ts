import { parse } from "yaml";

export type ParsedFrontmatterDocument = {
  data: Record<string, unknown>;
  content: string;
};

export type ParseFrontmatterOptions = {
  throwOnInvalid?: boolean;
};

const openingDelimiterPattern = /^(?:\uFEFF)?---[ \t]*(?:\r?\n|$)/u;
const closingDelimiterPattern = /^---[ \t]*(?:\r?\n|$)/mu;

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
};

export const parseFrontmatter = (
  source: string,
  options: ParseFrontmatterOptions = {},
): ParsedFrontmatterDocument => {
  const openingMatch = openingDelimiterPattern.exec(source);
  if (!openingMatch) {
    return {
      data: {},
      content: source.replace(/^\uFEFF/u, ""),
    };
  }

  const bodyStart = openingMatch[0].length;
  const bodyAndContent = source.slice(bodyStart);
  const closingMatch = closingDelimiterPattern.exec(bodyAndContent);
  if (!closingMatch || typeof closingMatch.index !== "number") {
    return {
      data: {},
      content: source.replace(/^\uFEFF/u, ""),
    };
  }

  const yamlSource = bodyAndContent.slice(0, closingMatch.index);
  const content = bodyAndContent.slice(closingMatch.index + closingMatch[0].length);
  let data: Record<string, unknown> = {};
  if (yamlSource.trim().length > 0) {
    try {
      data = asRecord(parse(yamlSource));
    } catch (error: unknown) {
      if (options.throwOnInvalid) {
        throw error;
      }
      data = {};
    }
  }

  return {
    data,
    content,
  };
};
