import { TRUTHMARK_BLOCK_END, TRUTHMARK_BLOCK_START } from "./templates/agents-block.js";

export type ParsedManagedBlock =
  | { status: "absent" }
  | { status: "valid"; start: number; end: number }
  | { status: "malformed" };

const findMarkerIndexes = (content: string, marker: string): number[] => {
  const indexes: number[] = [];
  let cursor = 0;

  while (true) {
    const index = content.indexOf(marker, cursor);
    if (index === -1) {
      return indexes;
    }

    indexes.push(index);
    cursor = index + marker.length;
  }
};

export const parseManagedBlock = (content: string): ParsedManagedBlock => {
  const starts = findMarkerIndexes(content, TRUTHMARK_BLOCK_START);
  const ends = findMarkerIndexes(content, TRUTHMARK_BLOCK_END);

  if (starts.length === 0 && ends.length === 0) {
    return { status: "absent" };
  }

  if (starts.length !== 1 || ends.length !== 1) {
    return { status: "malformed" };
  }

  const start = starts[0];
  const endStart = ends[0];

  if (start === -1 || endStart === -1 || endStart < start) {
    return { status: "malformed" };
  }

  return {
    status: "valid",
    start,
    end: endStart + TRUTHMARK_BLOCK_END.length,
  };
};

export const extractManagedBlock = (content: string): string | null => {
  const block = parseManagedBlock(content);

  if (block.status !== "valid") {
    return null;
  }

  return content.slice(block.start, block.end);
};

const trimmedBoundary = (value: string): string => value.replace(/\n+$/u, "");

export const upsertManagedBlock = (
  existingContent: string | null,
  block: string,
): string => {
  if (existingContent === null || existingContent.trim().length === 0) {
    return block;
  }

  const marker = parseManagedBlock(existingContent);

  if (marker.status !== "valid") {
    return `${trimmedBoundary(existingContent)}\n\n${block}`;
  }

  const before = trimmedBoundary(existingContent.slice(0, marker.start));
  const after = existingContent.slice(marker.end).replace(/^\n+/u, "");

  if (before.length === 0 && after.length === 0) {
    return block;
  }

  if (before.length === 0) {
    return `${block}\n\n${after}`;
  }

  if (after.length === 0) {
    return `${before}\n\n${block}`;
  }

  return `${before}\n\n${block}\n\n${after}`;
};
