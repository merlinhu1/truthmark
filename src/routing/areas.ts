import { parse } from "yaml";

import type { Diagnostic } from "../output/diagnostic.js";

export const TRUTH_DOCUMENT_KINDS = [
  "product-capability",
  "engineering-behavior",
  "engineering-contract",
  "engineering-workflow",
  "engineering-architecture",
  "engineering-operations",
  "engineering-test-behavior",
] as const;

export type TruthDocumentKind = (typeof TRUTH_DOCUMENT_KINDS)[number];
export type TruthDocumentLane = "product" | "engineering";

export type TruthDocumentEntry = {
  path: string;
  kind: TruthDocumentKind;
  kindSource: "explicit" | "inferred" | "defaulted";
  lane: TruthDocumentLane;
  laneSource: "explicit" | "inferred" | "defaulted";
  realizedBy: string[];
  realizes: string[];
  dependsOn: string[];
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

type TruthAreaFileReference = {
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
  productTruthRoot?: string;
  engineeringTruthRoot?: string;
};

const DEFAULT_PRODUCT_TRUTH_DOCS_ROOT = "docs/truthmark/product";
const DEFAULT_ENGINEERING_TRUTH_DOCS_ROOT = "docs/truthmark/engineering";

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
    .map((line) => line.slice(2).trim().replaceAll("\\*", "*"))
    .filter((line) => line.length > 0);
};

const isTruthDocumentKind = (value: unknown): value is TruthDocumentKind => {
  return (
    typeof value === "string" &&
    TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind)
  );
};

export const inferTruthDocumentKindFromPath = (
  documentPath: string,
  options: ParseAreasMarkdownOptions = {},
): TruthDocumentKind | null => {
  const normalizedPath = documentPath.replaceAll("\\", "/");
  const productTruthRoot = (
    options.productTruthRoot ?? DEFAULT_PRODUCT_TRUTH_DOCS_ROOT
  )
    ?.replaceAll("\\", "/")
    .replace(/\/+$/u, "");
  const engineeringTruthRoot = (
    options.engineeringTruthRoot ??
    options.truthDocsRoot ??
    DEFAULT_ENGINEERING_TRUTH_DOCS_ROOT
  )
    ?.replaceAll("\\", "/")
    .replace(/\/+$/u, "");

  if (productTruthRoot && normalizedPath.startsWith(`${productTruthRoot}/`)) {
    return "product-capability";
  }

  if (
    engineeringTruthRoot &&
    normalizedPath.startsWith(`${engineeringTruthRoot}/`)
  ) {
    if (normalizedPath.includes("/contracts/")) return "engineering-contract";
    if (normalizedPath.includes("/workflows/")) return "engineering-workflow";
    if (normalizedPath.includes("/architecture/"))
      return "engineering-architecture";
    if (normalizedPath.includes("/operations/"))
      return "engineering-operations";
    if (normalizedPath.includes("/tests/")) return "engineering-test-behavior";
    return "engineering-behavior";
  }

  return null;
};

const inferTruthDocumentLaneFromPath = (
  documentPath: string,
  options: ParseAreasMarkdownOptions = {},
): TruthDocumentLane | null => {
  const normalizedPath = documentPath.replaceAll("\\", "/");
  const productTruthRoot = (
    options.productTruthRoot ?? DEFAULT_PRODUCT_TRUTH_DOCS_ROOT
  )
    .replaceAll("\\", "/")
    .replace(/\/+$/u, "");
  const engineeringTruthRoot = (
    options.engineeringTruthRoot ??
    options.truthDocsRoot ??
    DEFAULT_ENGINEERING_TRUTH_DOCS_ROOT
  )
    .replaceAll("\\", "/")
    .replace(/\/+$/u, "");

  if (normalizedPath.startsWith(`${productTruthRoot}/`)) {
    return "product";
  }

  if (normalizedPath.startsWith(`${engineeringTruthRoot}/`)) {
    return "engineering";
  }

  return null;
};

export const laneForTruthDocumentKind = (
  kind: TruthDocumentKind,
): TruthDocumentLane => {
  return kind.startsWith("product-") ? "product" : "engineering";
};

export const docTypeForTruthDocumentKind = (
  kind: TruthDocumentKind,
): string => {
  if (kind.startsWith("product-")) {
    return "product";
  }
  return kind.slice("engineering-".length);
};

const parseStringListField = (rawEntry: unknown, field: string): string[] => {
  if (!rawEntry || typeof rawEntry !== "object" || !(field in rawEntry)) {
    return [];
  }

  const value = (rawEntry as Record<string, unknown>)[field];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
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
  const openingFenceIndex = trimmedLines.findIndex((line) =>
    /^```(?:yaml|yml)?$/u.test(line),
  );

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
    const inferredLane = inferTruthDocumentLaneFromPath(documentPath, options);

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
      kind: inferredKind ?? "engineering-behavior",
      kindSource: inferredKind ? ("inferred" as const) : ("defaulted" as const),
      lane: inferredLane ?? "engineering",
      laneSource: inferredLane ? ("inferred" as const) : ("defaulted" as const),
      realizedBy: [],
      realizes: [],
      dependsOn: [],
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
  options: ParseAreasMarkdownOptions,
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
        .slice(
          yamlFenceRange.openingFenceIndex + 1,
          yamlFenceRange.closingFenceIndex,
        )
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
    parsedBlock &&
    typeof parsedBlock === "object" &&
    "truth_documents" in parsedBlock
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
    const lane =
      rawEntry && typeof rawEntry === "object" && "lane" in rawEntry
        ? (rawEntry as { lane?: unknown }).lane
        : null;
    const inferredKind =
      typeof path === "string"
        ? inferTruthDocumentKindFromPath(path, options)
        : null;
    const inferredLane =
      typeof path === "string"
        ? inferTruthDocumentLaneFromPath(path, options)
        : null;
    const normalizedKind = isTruthDocumentKind(kind) ? kind : inferredKind;
    const normalizedLane =
      lane === "product" || lane === "engineering"
        ? lane
        : normalizedKind
          ? laneForTruthDocumentKind(normalizedKind)
          : inferredLane;

    if (
      typeof path !== "string" ||
      path.trim().length === 0 ||
      !normalizedKind ||
      !normalizedLane
    ) {
      diagnostics.push(
        createAreaDiagnostic(
          `Area ${areaName} truth_documents entries must include non-empty path plus valid lane and kind fields.`,
          areaName,
        ),
      );
      continue;
    }

    truthDocumentEntries.push({
      path: path.trim(),
      kind: normalizedKind,
      kindSource: isTruthDocumentKind(kind) ? "explicit" : "inferred",
      lane: normalizedLane,
      laneSource:
        lane === "product" || lane === "engineering" ? "explicit" : "inferred",
      realizedBy: parseStringListField(rawEntry, "realized_by"),
      realizes: parseStringListField(rawEntry, "realizes"),
      dependsOn: parseStringListField(rawEntry, "depends_on"),
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

  const yamlResult = parseTruthDocumentsFromYaml(
    sectionLines,
    areaName,
    options,
  );

  if (
    yamlResult.diagnostics.length > 0 ||
    yamlFenceRange.closingFenceIndex === null
  ) {
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
    const codeSurface = parseListSection(
      currentSections.get("Code surface") ?? [],
    );
    const updateTruthWhen = parseListSection(
      currentSections.get("Update truth when") ?? [],
    );
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

    if (
      hasTruthDocuments === hasAreaFiles ||
      codeSurface.length === 0 ||
      updateTruthWhen.length === 0
    ) {
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

    if (
      /^(Truth documents|Area files|Code surface|Update truth when):$/u.test(
        line.trim(),
      )
    ) {
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
