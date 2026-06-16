import fs from "node:fs/promises";
import fg from "fast-glob";

import type { Diagnostic } from "../output/diagnostic.js";
import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";
import { hashText } from "../markdown/hash.js";
import { parseEvidenceReferences } from "./parse.js";
import type { EvidenceReference } from "./types.js";

const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const diagnosticFor = (reference: EvidenceReference, message: string): Diagnostic => ({
  category: "source-traceability",
  severity: "error",
  message,
  file: reference.truthDocPath,
  data: {
    reference: reference.path,
    source: reference.source,
  },
});

const parseDiagnosticFor = (truthDocPath: string, error: unknown): Diagnostic => ({
  category: "source-traceability",
  severity: "error",
  message: `Malformed evidence YAML block in ${truthDocPath}: ${
    error instanceof Error ? error.message : String(error)
  }`,
  file: truthDocPath,
  data: {
    source: "evidence-block",
  },
});

const isGlobReference = (referencePath: string): boolean => /[*?[\]{}()]/u.test(referencePath);

const validateGlob = async (
  rootDir: string,
  reference: EvidenceReference,
): Promise<Diagnostic | null> => {
  if (reference.path.startsWith("../") || reference.path.startsWith("/")) {
    return diagnosticFor(reference, `Referenced file pattern ${reference.path} must stay inside the repository root.`);
  }
  const matches = await fg(reference.path, {
    cwd: rootDir,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
  });
  return matches.length > 0
    ? null
    : diagnosticFor(reference, `Referenced file pattern ${reference.path} does not match any file.`);
};

const validateHash = async (
  rootDir: string,
  reference: EvidenceReference,
): Promise<Diagnostic | null> => {
  if (!reference.contentHash) {
    return null;
  }
  if (!reference.contentHash.startsWith("sha256:")) {
    return diagnosticFor(reference, `Evidence hash for ${reference.path} must use sha256:.`);
  }

  const source = await fs.readFile(resolveRepoPath(rootDir, reference.path), "utf8");
  const lines = source.split("\n");
  const startLine = reference.startLine ?? 1;
  const endLine = reference.endLine ?? lines.length;

  if (startLine < 1 || endLine < startLine || endLine > lines.length) {
    return diagnosticFor(reference, `Evidence line span for ${reference.path} is outside the file.`);
  }

  const actualHash = `sha256:${hashText(lines.slice(startLine - 1, endLine).join("\n"))}`;

  return actualHash === reference.contentHash
    ? null
    : diagnosticFor(reference, `Evidence hash for ${reference.path} is stale.`);
};

const validateLineSpan = async (
  rootDir: string,
  reference: EvidenceReference,
): Promise<Diagnostic | null> => {
  if (reference.startLine === undefined && reference.endLine === undefined) {
    return null;
  }

  const source = await fs.readFile(resolveRepoPath(rootDir, reference.path), "utf8");
  const lines = source.split("\n");
  const startLine = reference.startLine ?? 1;
  const endLine = reference.endLine ?? lines.length;

  return startLine < 1 || endLine < startLine || endLine > lines.length
    ? diagnosticFor(reference, `Evidence line span for ${reference.path} is outside the file.`)
    : null;
};

const validateReference = async (
  rootDir: string,
  reference: EvidenceReference,
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  try {
    if (isGlobReference(reference.path)) {
      const globDiagnostic = await validateGlob(rootDir, reference);
      return globDiagnostic ? [globDiagnostic] : [];
    }

    const absolutePath = resolveRepoPath(rootDir, reference.path);
    await assertRepoContainment(rootDir, absolutePath);

    if (!(await pathExists(absolutePath))) {
      diagnostics.push(diagnosticFor(reference, `Referenced file ${reference.path} does not exist.`));
      return diagnostics;
    }

    const lineSpanDiagnostic = await validateLineSpan(rootDir, reference);
    if (lineSpanDiagnostic) {
      diagnostics.push(lineSpanDiagnostic);
    } else {
      const hashDiagnostic = await validateHash(rootDir, reference);
      if (hashDiagnostic) {
        diagnostics.push(hashDiagnostic);
      }
    }
  } catch {
    diagnostics.push(diagnosticFor(reference, `Referenced file ${reference.path} must stay inside the repository root.`));
  }

  return diagnostics;
};

export const validateEvidenceReferences = async (
  rootDir: string,
  truthDocPaths: string[],
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  for (const truthDocPath of [...truthDocPaths].sort()) {
    let references: EvidenceReference[];
    try {
      references = await parseEvidenceReferences(rootDir, truthDocPath);
    } catch (error) {
      diagnostics.push(parseDiagnosticFor(truthDocPath, error));
      continue;
    }

    for (const reference of references) {
      diagnostics.push(...(await validateReference(rootDir, reference)));
    }
  }

  return diagnostics;
};
