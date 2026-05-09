import fg from "fast-glob";

type ResolveAuthorityPathsResult = {
  paths: string[];
  diagnostics: [];
};

const looksLikeGlob = (pattern: string): boolean => {
  return /[*?[\]{}()!+@]/u.test(pattern);
};

export const resolveAuthorityPaths = async (
  rootDir: string,
  authority: string[],
): Promise<ResolveAuthorityPathsResult> => {
  const orderedPaths: string[] = [];
  const seenPaths = new Set<string>();

  for (const entry of authority) {
    const expandedPaths = looksLikeGlob(entry)
      ? await fg([entry], { cwd: rootDir, onlyFiles: true })
      : [entry];

    for (const path of expandedPaths.sort()) {
      if (!seenPaths.has(path)) {
        seenPaths.add(path);
        orderedPaths.push(path);
      }
    }
  }

  return {
    paths: orderedPaths,
    diagnostics: [],
  };
};