import { checkControlledPaths, type AuthorityCheckResult } from "../checks/authority.js";

export type ResolveAuthorityPathsResult = AuthorityCheckResult;

/**
 * Resolves configured Truthmark-controlled Markdown paths.
 */
export const resolveAuthorityPaths = async (
  rootDir: string,
  authority: string[],
): Promise<ResolveAuthorityPathsResult> => {
  return checkControlledPaths(rootDir, authority);
};
