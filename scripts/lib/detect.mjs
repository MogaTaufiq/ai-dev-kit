import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const KIT_FILES = [
  "AGENTS.md", "CLAUDE.md", "CODING_STANDARDS.md", "CHANGELOG.md", "DESIGN.md",
  "eslint.config.mjs", "eslint.config.js", "eslint.config.ts", "playwright.config.ts",
  ".github/workflows/ci.yml", ".githooks/pre-commit", "ruff.toml", "pyrightconfig.json",
];

export function readPackage(dir) {
  const file = join(dir, "package.json");
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

export function stacksIn(dir) {
  const pkg = readPackage(dir);
  const deps = pkg ? { ...pkg.dependencies, ...pkg.devDependencies } : {};
  const stacks = [];
  if (deps.next) stacks.push("ts-next");
  else if (deps.vite) stacks.push("ts-vite");
  if (existsSync(join(dir, "pyproject.toml")) || existsSync(join(dir, "requirements.txt"))) stacks.push("python");
  return stacks;
}

function gitRemotes(repo) {
  try {
    return execFileSync("git", ["remote", "-v"], { cwd: repo, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

export function detectStack(repo) {
  const stacks = stacksIn(repo);
  const git = existsSync(join(repo, ".git"));
  const children = stacks.length
    ? []
    : readdirSync(repo, { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && stacksIn(join(repo, e.name)).length)
        .map((e) => e.name);
  return {
    stacks,
    git,
    github: git && gitRemotes(repo).includes("github.com"),
    existing: KIT_FILES.filter((f) => existsSync(join(repo, f))),
    children: children.length >= 2 ? children : [],
  };
}
