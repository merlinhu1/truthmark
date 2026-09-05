import { it } from "node:test";

export const isWindows = process.platform === "win32";

// Windows has no POSIX executable bit, refuses tab/newline/trailing-space file
// names, and denies symlink creation to non-elevated users. Tests that assert
// those filesystem semantics can only run on POSIX hosts.
export const posixOnlyIt = isWindows ? it.skip : it;
