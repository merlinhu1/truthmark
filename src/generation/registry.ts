import { truthDocUpdatePrompt } from "./prompts/truth-doc-update.js";
import type { ContentPromptId, ContentPromptSpec } from "./types.js";

const contentPrompts = [truthDocUpdatePrompt] satisfies ContentPromptSpec[];

const promptById = new Map<ContentPromptId, ContentPromptSpec>(
  contentPrompts.map((prompt) => [prompt.id, prompt]),
);

export const listContentPrompts = (): ContentPromptSpec[] => {
  return [...contentPrompts];
};

export const getContentPrompt = (id: ContentPromptId): ContentPromptSpec => {
  const prompt = promptById.get(id);
  if (!prompt) {
    throw new Error(`Unknown content prompt: ${id}`);
  }

  return prompt;
};