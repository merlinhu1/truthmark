import type { ContextPack } from "./types.js";

export const renderContextPackMarkdown = (pack: ContextPack): string => {
  const lines = [
    `# Truthmark ContextPack (${pack.workflow})`,
    "",
    `Schema: ${pack.schemaVersion}`,
    `Base: ${pack.base ?? "none"}`,
    "",
    "## Allowed Write Paths",
    ...pack.allowedWritePaths.map((filePath) => `- ${filePath}`),
    "",
    "## Truth Docs",
    ...pack.truthDocs.map((doc) => `- ${doc.path}`),
    "",
    "## Source Files",
    ...pack.sourceFiles.map((file) => `- ${file.path}${file.truncated ? " (truncated)" : ""}`),
    "",
    "## Test Commands",
    ...pack.testCommands.map((command) => `- ${command}`),
  ];

  return `${lines.join("\n")}\n`;
};
