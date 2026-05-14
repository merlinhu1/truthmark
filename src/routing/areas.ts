import { parse } from "yaml";

import type { Diagnostic } from "../output/diagnostic.js";

export const TRUTH_DOCUMENT_KINDS = [
  "behavior",
  "contract",
  "architecture",
  "workflow",
  "operations",
  "test-behavior",
] as const;

export type TruthDocumentKind = (typeof TRUTH_DOCUMENT_KINDS)[number];

export type TruthDocumentEntry = {
  path: string;
  kind: TruthDocumentKind;
  kindSource: "explicit" | "inferred" | "defaulted";
};

export type TruthArea = {
  id: string;
  name: string;
  key: string;
  truthDocuments: string[];
  truthDocumentEntries: TruthDocumentEntry[];
  codeSurface: string[];
  updateTruthWhen: string[];
};

export type TruthAreaReference = {
  id: string;
  name: string;
  key: string;
  truthDocuments: string[];
  truthDocumentEntries: TruthDocumentEntry[];
};

export type TruthAreaFileReference = {
  id: string;
  name: string;
  key: string;
  areaFiles: string[];
  codeSurface: string[];
  updateTruthWhen: string[];
};

type ParseAreasMarkdownResult = {
  areas: TruthArea[];
  truthDocumentReferences: TruthAreaReference[];
  areaFileReferences: TruthAreaFileReference[];
  diagnostics: Diagnostic[];
};

export type ParseAreasMarkdownOptions = {
  truthDocsRoot?: string;
};

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createAreaDiagnostic = (
  message: string,
  area?: string,
  severity: Diagnostic["severity"] = "error",
): Diagnostic => {
  return {
    category: "area-index",
    severity,
    message,
    area,
  };
};

const parseListSection = (sectionLines: string[]): string[] => {
  return sectionLines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter((line) => line.length > 0);
};

const isTruthDocumentKind = (value: unknown): value is TruthDocumentKind => {
  return typeof value === "string" && TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind);
};

export const inferTruthDocumentKindFromPath = (
  documentPath: string,
  options: ParseAreasMarkdownOptions = {},
): TruthDocumentKind | null => {
  const normalizedPath = documentPath.replaceAll("\\", "/");
  const truthDocsRoot = options.truthDocsRoot?.replaceAll("\\", "/").replace(/\/+$/u, "");

  if (
    (truthDocsRoot && normalizedPath.startsWith(`${truthDocsRoot}/`)) ||
    normalizedPath.startsWith("docs/truth/")
  ) {
    return "behavior";
  }

  if (
    normalizedPath.startsWith("docs/contracts/") ||
    normalizedPath.startsWith("docs/contract/") ||
    normalizedPath.startsWith("docs/api/")
  ) {
    return "contract";
  }

  if (normalizedPath.startsWith("docs/architecture/")) {
    return "architecture";
  }

  if (normalizedPath.startsWith("docs/workflows/") || normalizedPath.startsWith("docs/workflow/")) {
    return "workflow";
  }

  if (normalizedPath.startsWith("docs/operations/") || normalizedPath.startsWith("docs/platform/")) {
    return "operations";
  }

  if (normalizedPath.startsWith("docs/testing/") || normalizedPath.startsWith("docs/tests/")) {
    return "test-behavior";
  }

  return null;
};

type TruthDocumentsSectionResult = {
  truthDocuments: string[];
  truthDocumentEntries: TruthDocumentEntry[];
  diagnostics: Diagnostic[];
};

type TruthDocumentsYamlFenceRange = {
  openingFenceIndex: number;
  closingFenceIndex: number | null;
};

const findTruthDocumentsYamlFenceRange = (
  sectionLines: string[],
): TruthDocumentsYamlFenceRange | null => {
  const trimmedLines = sectionLines.map((line) => line.trim());
  const openingFenceIndex = trimmedLines.findIndex((line) => /^```(?:yaml|yml)?$/u.test(line));

  if (openingFenceIndex === -1) {
    return null;
  }

  const closingFenceIndex = trimmedLines.findIndex(
    (line, index) => index > openingFenceIndex && line === "```",
  );

  return {
    openingFenceIndex,
    closingFenceIndex: closingFenceIndex === -1 ? null : closingFenceIndex,
  };
};

const parseTruthDocumentsFromList = (
  sectionLines: string[],
  areaName: string,
  options: ParseAreasMarkdownOptions,
): TruthDocumentsSectionResult => {
  const diagnostics: Diagnostic[] = [];
  const truthDocuments = parseListSection(sectionLines);
  const truthDocumentEntries = truthDocuments.map((documentPath) => {
    const inferredKind = inferTruthDocumentKindFromPath(documentPath, options);

    if (!inferredKind) {
      diagnostics.push(
        createAreaDiagnostic(
          `Truth document ${documentPath} does not match a known kind path convention; defaulting to behavior.`,
          areaName,
          "review",
        ),
      );
    }

    return {
      path: documentPath,
      kind: inferredKind ?? "behavior",
      kindSource: inferredKind ? ("inferred" as const) : ("defaulted" as const),
    };
  });

  return {
    truthDocuments,
    truthDocumentEntries,
    diagnostics,
  };
};

const parseTruthDocumentsFromYaml = (
  sectionLines: string[],
  areaName: string,
): TruthDocumentsSectionResult => {
  const yamlFenceRange = findTruthDocumentsYamlFenceRange(sectionLines);

  if (!yamlFenceRange) {
    return {
      truthDocuments: [],
      truthDocumentEntries: [],
      diagnostics: [],
    };
  }

  if (yamlFenceRange.closingFenceIndex === null) {
    return {
      truthDocuments: [],
      truthDocumentEntries: [],
      diagnostics: [
        createAreaDiagnostic(
          `Area ${areaName} has an unterminated fenced YAML Truth documents block.`,
          areaName,
        ),
      ],
    };
  }

  let parsedBlock: unknown;

  try {
    parsedBlock = parse(
      sectionLines
        .slice(yamlFenceRange.openingFenceIndex + 1, yamlFenceRange.closingFenceIndex)
        .join("\n"),
    );
  } catch (error: unknown) {
    return {
      truthDocuments: [],
      truthDocumentEntries: [],
      diagnostics: [
        createAreaDiagnostic(
          `Area ${areaName} has invalid YAML truth document metadata: ${error instanceof Error ? error.message : String(error)}.`,
          areaName,
        ),
      ],
    };
  }

  const rawEntries =
    parsedBlock && typeof parsedBlock === "object" && "truth_documents" in parsedBlock
      ? (parsedBlock as { truth_documents?: unknown }).truth_documents
      : null;

  if (!Array.isArray(rawEntries)) {
    return {
      truthDocuments: [],
      truthDocumentEntries: [],
      diagnostics: [
        createAreaDiagnostic(
          `Area ${areaName} must define a truth_documents array inside the fenced YAML block.`,
          areaName,
        ),
      ],
    };
  }

  const diagnostics: Diagnostic[] = [];
  const truthDocumentEntries: TruthDocumentEntry[] = [];

  for (const rawEntry of rawEntries) {
    const path =
      rawEntry && typeof rawEntry === "object" && "path" in rawEntry
        ? (rawEntry as { path?: unknown }).path
        : null;
    const kind =
      rawEntry && typeof rawEntry === "object" && "kind" in rawEntry
        ? (rawEntry as { kind?: unknown }).kind
        : null;

    if (typeof path !== "string" || path.trim().length === 0 || !isTruthDocumentKind(kind)) {
      diagnostics.push(
        createAreaDiagnostic(
          `Area ${areaName} truth_documents entries must include non-empty path and valid kind fields.`,
          areaName,
        ),
      );
      continue;
    }

    truthDocumentEntries.push({
      path: path.trim(),
      kind,
      kindSource: "explicit",
    });
  }

  return {
    truthDocuments: truthDocumentEntries.map((entry) => entry.path),
    truthDocumentEntries,
    diagnostics,
  };
};

const parseTruthDocumentsSection = (
  sectionLines: string[],
  areaName: string,
  options: ParseAreasMarkdownOptions,
): TruthDocumentsSectionResult => {
  const yamlFenceRange = findTruthDocumentsYamlFenceRange(sectionLines);

  if (!yamlFenceRange) {
    return parseTruthDocumentsFromList(sectionLines, areaName, options);
  }

  const yamlResult = parseTruthDocumentsFromYaml(sectionLines, areaName);

  if (yamlResult.diagnostics.length > 0 || yamlFenceRange.closingFenceIndex === null) {
    return yamlResult;
  }

  return yamlResult;
};

export const parseAreasMarkdown = (
  source: string,
  options: ParseAreasMarkdownOptions = {},
): ParseAreasMarkdownResult => {
  const lines = source.split("\n");
  const diagnostics: Diagnostic[] = [];
  const areas: TruthArea[] = [];
  const truthDocumentReferences: TruthAreaReference[] = [];
  const areaFileReferences: TruthAreaFileReference[] = [];
  let areaIndex = 0;

  let currentAreaName: string | null = null;
  let currentSections = new Map<string, string[]>();
  let currentSectionName: string | null = null;

  const flushArea = (): void => {
    if (!currentAreaName) {
      return;
    }

    const truthDocumentResult = parseTruthDocumentsSection(
      currentSections.get("Truth documents") ?? [],
      currentAreaName,
      options,
    );
    const { truthDocuments, truthDocumentEntries } = truthDocumentResult;
    const areaFiles = parseListSection(currentSections.get("Area files") ?? []);
    const codeSurface = parseListSection(currentSections.get("Code surface") ?? []);
    const updateTruthWhen = parseListSection(currentSections.get("Update truth when") ?? []);
    const areaKey = slugify(currentAreaName);
    const areaId = areaKey.length > 0 ? areaKey : `area-${areaIndex}`;
    const hasTruthDocuments = truthDocuments.length > 0;
    const hasAreaFiles = areaFiles.length > 0;

    areaIndex += 1;
    diagnostics.push(...truthDocumentResult.diagnostics);

    if (hasTruthDocuments) {
      truthDocumentReferences.push({
        id: areaId,
        name: currentAreaName,
        key: areaKey,
        truthDocuments,
        truthDocumentEntries,
      });
    }

    if (hasTruthDocuments === hasAreaFiles || codeSurface.length === 0 || updateTruthWhen.length === 0) {
      diagnostics.push(
        createAreaDiagnostic(
          `Area ${currentAreaName} must define exactly one of Truth documents or Area files, plus Code surface and Update truth when sections.`,
          currentAreaName,
        ),
      );
    } else if (hasAreaFiles) {
      areaFileReferences.push({
        id: areaId,
        name: currentAreaName,
        key: areaKey,
        areaFiles,
        codeSurface,
        updateTruthWhen,
      });
    } else {
      areas.push({
        id: areaId,
        name: currentAreaName,
        key: areaKey,
        truthDocuments,
        truthDocumentEntries,
        codeSurface,
        updateTruthWhen,
      });
    }

    currentAreaName = null;
    currentSections = new Map();
    currentSectionName = null;
  };

  for (const line of lines) {
    const areaHeadingMatch = line.match(/^\s{0,3}##\s+(.*)$/u);

    if (areaHeadingMatch) {
      flushArea();
      currentAreaName = areaHeadingMatch[1]?.trim() ?? null;
      continue;
    }

    if (!currentAreaName) {
      continue;
    }

    if (/^(Truth documents|Area files|Code surface|Update truth when):$/u.test(line.trim())) {
      currentSectionName = line.trim().slice(0, -1);
      currentSections.set(currentSectionName, []);
      continue;
    }

    if (currentSectionName) {
      currentSections.get(currentSectionName)?.push(line);
    }
  }

  flushArea();

  return {
    areas,
    truthDocumentReferences,
    areaFileReferences,
    diagnostics,
  };
};
