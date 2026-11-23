import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve, sep } from "node:path";

export const excludeFile = () => join(homedir(), ".config", "ai-dev-kit", "exclude");

export function readExcludes(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => resolve(l.startsWith("~") ? join(homedir(), l.slice(1)) : l));
}

const real = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
};

export function isExcluded(repo, prefixes) {
  const r = real(repo);
  return prefixes.some((p) => {
    const x = real(p);
    return r === x || r.startsWith(x + sep);
  });
}
