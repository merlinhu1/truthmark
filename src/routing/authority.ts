import type { TruthmarkConfig } from "../config/schema.js";
import { checkAuthority, type AuthorityCheckResult } from "../checks/authority.js";

export type ResolveAuthorityPathsResult = AuthorityCheckResult;

/**
 * Backwards-compatible shim for the earlier routing authority helper.
 * Prefer checkAuthority from ../checks/authority.ts for runtime validation.
 */
export const resolveAuthorityPaths = async (
  rootDir: string,
  authority: string[],
): Promise<ResolveAuthorityPathsResult> => {
  const config = { authority } as unknown as TruthmarkConfig;
  return checkAuthority(rootDir, config);
};

