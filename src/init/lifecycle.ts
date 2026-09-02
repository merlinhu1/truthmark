import fs from "node:fs/promises";
import type { TruthmarkConfig } from "../config/schema.js";
import {
  resolveRepoPath,
  resolveSafeExactFileTarget,
  type SafeExactFileTarget,
} from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { parseManagedBlock } from "../managed-block.js";
import {
  renderGeneratedSurfaceCatalog,
  renderGeneratedSurfaces,
  RETIRED_GENERATED_SURFACES,
} from "../templates/generated-surfaces.js";

export type LifecycleAction =
  | "remove-file"
  | "remove-managed-block"
  | "preserve"
  | "manual-review";

export type LifecyclePlanEntry = {
  path: string;
  action: LifecycleAction;
  reason: string;
};

export type LifecyclePlan = {
  schemaVersion: "truthmark-lifecycle/v0";
  mode: "dry-run" | "apply";
  entries: LifecyclePlanEntry[];
  diagnostics: Diagnostic[];
  applicable: boolean;
  applied: boolean;
};

const plannedContents = new WeakMap<LifecyclePlan, Map<string, string>>();
const plannedTargets = new WeakMap<
  LifecyclePlan,
  Map<string, SafeExactFileTarget>
>();
const plannedExcludedRoots = new WeakMap<LifecyclePlan, readonly string[]>();
const readFile = async (
  rootDir: string,
  filePath: string,
): Promise<string | null> => {
  try {
    return await fs.readFile(resolveRepoPath(rootDir, filePath), "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return null;
    throw error;
  }
};

const listFiles = async (
  rootDir: string,
  directory: string,
): Promise<string[]> => {
  const files: string[] = [];
  const stack = [directory];
  while (stack.length > 0) {
    const current = stack.pop()!;
    try {
      for (const entry of await fs.readdir(resolveRepoPath(rootDir, current), {
        withFileTypes: true,
      })) {
        const next = `${current}/${entry.name}`;
        if (entry.isDirectory()) stack.push(next);
        else if (entry.isFile() || entry.isSymbolicLink()) files.push(next);
      }
    } catch (error: unknown) {
      if (
        !(error instanceof Error && "code" in error && error.code === "ENOENT")
      )
        throw error;
    }
  }
  return files;
};

const findRetiredSurfaces = async (rootDir: string): Promise<string[]> => {
  const paths = new Set<string>();
  for (const filePath of RETIRED_GENERATED_SURFACES.exactPaths) {
    try {
      await fs.lstat(resolveRepoPath(rootDir, filePath));
      paths.add(filePath);
    } catch (error: unknown) {
      if (
        !(error instanceof Error && "code" in error && error.code === "ENOENT")
      )
        throw error;
    }
  }
  for (const root of RETIRED_GENERATED_SURFACES.recursiveRoots)
    for (const filePath of await listFiles(rootDir, root)) paths.add(filePath);
  for (const skillRoot of RETIRED_GENERATED_SURFACES.skillRoots) {
    for (const packageName of RETIRED_GENERATED_SURFACES.retiredPackages)
      for (const filePath of await listFiles(
        rootDir,
        `${skillRoot}/${packageName}`,
      ))
        paths.add(filePath);
    let packages: string[] = [];
    try {
      packages = (
        await fs.readdir(resolveRepoPath(rootDir, skillRoot), {
          withFileTypes: true,
        })
      )
        .filter(
          (entry) => entry.isDirectory() && entry.name.startsWith("truthmark-"),
        )
        .map((entry) => entry.name);
    } catch (error: unknown) {
      if (
        !(error instanceof Error && "code" in error && error.code === "ENOENT")
      )
        throw error;
    }
    for (const packageName of packages)
      for (const retiredFile of RETIRED_GENERATED_SURFACES.retiredPackageFiles) {
        const filePath = `${skillRoot}/${packageName}/${retiredFile}`;
        try {
          await fs.lstat(resolveRepoPath(rootDir, filePath));
          paths.add(filePath);
        } catch (error: unknown) {
          if (
            !(
              error instanceof Error &&
              "code" in error &&
              error.code === "ENOENT"
            )
          )
            throw error;
        }
      }
  }
  return [...paths];
};

export const buildLifecyclePlan = async (
  rootDir: string,
  config: TruthmarkConfig,
  mode: "dry-run" | "apply",
  desired = renderGeneratedSurfaces(config),
  excludedRoots: readonly string[] = [],
): Promise<LifecyclePlan> => {
  const desiredPaths = new Set(desired.map(({ path }) => path));
  const desiredTargetPaths = new Set<string>();
  const entries: LifecyclePlanEntry[] = [];
  const diagnostics: Diagnostic[] = [];
  const desiredTargets = new Map<string, SafeExactFileTarget>();
  const targets = new Map<string, SafeExactFileTarget>();
  let applicable = true;

  for (const surface of desired) {
    const target = await resolveSafeExactFileTarget(
      rootDir,
      surface.path,
      true,
      surface.managedBlock === true,
      excludedRoots,
    );
    if (!target) {
      applicable = false;
      entries.push({
        path: surface.path,
        action: "manual-review",
        reason: surface.managedBlock
          ? "Managed instruction destination does not resolve to a regular single-link file inside the worktree."
          : "Generated file destination is aliased or not a regular single-link file.",
      });
    } else {
      desiredTargets.set(surface.path, target);
      desiredTargetPaths.add(target.path);
    }
  }

  for (const surface of desired.filter(({ managedBlock }) => managedBlock)) {
    const target = desiredTargets.get(surface.path);
    if (!target) continue;
    const content = await readFile(rootDir, target.path);
    if (content !== null && parseManagedBlock(content).status === "malformed") {
      applicable = false;
      entries.push({
        path: surface.path,
        action: "manual-review",
        reason: "Truthmark managed-block markers are malformed.",
      });
    }
  }

  const plannedManagedRemovalTargets = new Set<string>();

  const catalog = renderGeneratedSurfaceCatalog(config);
  for (const retiredPath of await findRetiredSurfaces(rootDir)) {
    if (!catalog.some(({ path: catalogPath }) => catalogPath === retiredPath))
      catalog.push({
        path: retiredPath,
        content: "",
        owners: [
          {
            kind: "retired",
            manualCleanupOnly:
              retiredPath === "GEMINI.md" || retiredPath.startsWith(".gemini/"),
          },
        ],
        recognizedContents: [],
      });
  }

  for (const surface of catalog) {
    if (desiredPaths.has(surface.path)) continue;
    try {
      await fs.lstat(resolveRepoPath(rootDir, surface.path));
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT")
        continue;
      throw error;
    }
    const target = await resolveSafeExactFileTarget(
      rootDir,
      surface.path,
      false,
      surface.managedBlock === true,
      excludedRoots,
    );
    if (!target) {
      applicable = false;
      entries.push({
        path: surface.path,
        action: "manual-review",
        reason: "Path is not safely contained in the worktree.",
      });
      continue;
    }
    if (desiredTargetPaths.has(target.path)) continue;
    const content = await readFile(rootDir, target.path);
    if (content === null) continue;
    if (surface.path === "GEMINI.md" || surface.path.startsWith(".gemini/")) {
      entries.push({
        path: surface.path,
        action: "preserve",
        reason: "Gemini surfaces require manual cleanup.",
      });
    } else if (surface.managedBlock) {
      const block = parseManagedBlock(content);
      if (block.status === "malformed") {
        applicable = false;
        entries.push({
          path: surface.path,
          action: "manual-review",
          reason: "Truthmark managed-block markers are malformed.",
        });
      } else if (block.status === "valid") {
        if (plannedManagedRemovalTargets.has(target.path)) continue;
        plannedManagedRemovalTargets.add(target.path);
        entries.push({
          path: surface.path,
          action: "remove-managed-block",
          reason: "No configured platform owns this managed block.",
        });
        targets.set(surface.path, target);
      }
    } else if (surface.recognizedContents.includes(content)) {
      entries.push({
        path: surface.path,
        action: "remove-file",
        reason: "Generated file has no active platform owner.",
      });
      targets.set(surface.path, target);
    } else {
      entries.push({
        path: surface.path,
        action: "preserve",
        reason: "Generated path has diverged content and requires review.",
      });
      diagnostics.push({
        category: "generated-surface",
        severity: "review",
        message: `Generated surface ${surface.path} has diverged content; preserved for manual review.`,
        file: surface.path,
      });
    }
  }

  entries.sort(
    (a, b) => a.path.localeCompare(b.path) || a.action.localeCompare(b.action),
  );
  if (!applicable)
    diagnostics.push({
      category: "generated-surface",
      severity: "error",
      message:
        "Lifecycle changes were not applied because preflight found unsafe or malformed generated surfaces.",
    });
  const plan: LifecyclePlan = {
    schemaVersion: "truthmark-lifecycle/v0",
    mode,
    entries,
    diagnostics,
    applicable,
    applied: false,
  };
  const contents = new Map<string, string>();
  for (const entry of entries) {
    if (
      entry.action === "remove-file" ||
      entry.action === "remove-managed-block"
    ) {
      const target = targets.get(entry.path);
      const content = target ? await readFile(rootDir, target.path) : null;
      if (content !== null) contents.set(entry.path, content);
    }
  }
  plannedContents.set(plan, contents);
  plannedTargets.set(plan, targets);
  plannedExcludedRoots.set(plan, excludedRoots);
  return plan;
};

export const applyLifecyclePlan = async (
  rootDir: string,
  plan: LifecyclePlan,
): Promise<LifecyclePlan> => {
  if (!plan.applicable || plan.mode !== "apply") return plan;
  const expected = plannedContents.get(plan);
  const expectedTargets = plannedTargets.get(plan);
  const failure = async (entry: LifecyclePlanEntry): Promise<string | null> => {
    if (
      entry.action !== "remove-file" &&
      entry.action !== "remove-managed-block"
    )
      return null;
    const target = await resolveSafeExactFileTarget(
      rootDir,
      entry.path,
      false,
      entry.action === "remove-managed-block",
      plannedExcludedRoots.get(plan),
    );
    const expectedTarget = expectedTargets?.get(entry.path);
    if (
      !target ||
      !expectedTarget ||
      target.path !== expectedTarget.path ||
      target.aliased !== expectedTarget.aliased
    )
      return `Unsafe lifecycle target: ${entry.path}`;
    const content = await readFile(rootDir, target.path);
    if (content === null || expected?.get(entry.path) !== content)
      return `Lifecycle target changed after planning: ${entry.path}`;
    if (
      entry.action === "remove-managed-block" &&
      parseManagedBlock(content).status !== "valid"
    )
      return `Managed block changed during removal: ${entry.path}`;
    return null;
  };
  for (const entry of plan.entries) {
    const message = await failure(entry);
    if (message)
      return {
        ...plan,
        applicable: false,
        applied: false,
        diagnostics: [
          ...plan.diagnostics,
          {
            category: "generated-surface",
            severity: "error",
            message,
            file: entry.path,
          },
        ],
      };
  }
  for (const entry of plan.entries) {
    const target = expectedTargets?.get(entry.path);
    if (!target) continue;
    const absolutePath = resolveRepoPath(rootDir, target.path);
    if (entry.action === "remove-file") {
      const stat = await fs.lstat(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)
        throw new Error(
          `Refusing unsafe generated file removal: ${entry.path}`,
        );
      await fs.rm(absolutePath);
    } else if (entry.action === "remove-managed-block") {
      const stat = await fs.lstat(absolutePath);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1)
        throw new Error(`Refusing unsafe managed-block removal: ${entry.path}`);
      const content = await fs.readFile(absolutePath, "utf8");
      const block = parseManagedBlock(content);
      if (block.status !== "valid")
        throw new Error(`Managed block changed during removal: ${entry.path}`);
      const remaining = `${content.slice(0, block.start)}${content.slice(block.end)}`;
      if (remaining.trim().length === 0 && !target.aliased)
        await fs.rm(absolutePath);
      else await fs.writeFile(absolutePath, remaining, "utf8");
    }
  }
  return { ...plan, applied: true };
};
