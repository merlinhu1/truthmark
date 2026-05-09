import type { Diagnostic } from "../output/diagnostic.js";

export type TruthArea = {
  id: string;
  name: string;
  key: string;
  truthDocuments: string[];
  codeSurface: string[];
  updateTruthWhen: string[];
};

export type TruthAreaReference = {
  id: string;
  name: string;
  key: string;
  truthDocuments: string[];
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

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createAreaDiagnostic = (message: string, area?: string): Diagnostic => {
  return {
    category: "area-index",
    severity: "error",
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

export const parseAreasMarkdown = (source: string): ParseAreasMarkdownResult => {
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

    const truthDocuments = parseListSection(currentSections.get("Truth documents") ?? []);
    const areaFiles = parseListSection(currentSections.get("Area files") ?? []);
    const codeSurface = parseListSection(currentSections.get("Code surface") ?? []);
    const updateTruthWhen = parseListSection(currentSections.get("Update truth when") ?? []);
    const areaKey = slugify(currentAreaName);
    const areaId = areaKey.length > 0 ? areaKey : `area-${areaIndex}`;
    const hasTruthDocuments = truthDocuments.length > 0;
    const hasAreaFiles = areaFiles.length > 0;

    areaIndex += 1;

    if (hasTruthDocuments) {
      truthDocumentReferences.push({
        id: areaId,
        name: currentAreaName,
        key: areaKey,
        truthDocuments,
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
