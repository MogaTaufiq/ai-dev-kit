import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectStack, readPackage } from "./detect.mjs";

const KIT = fileURLToPath(new URL("../../", import.meta.url));
const src = (rel) => join(KIT, rel);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function defaultChecks(stack, tier) {
  if (stack === "python") return { task: "ruff check . && pyright && { pytest -q || [ $? -eq 5 ]; }", merge: "pytest -q || [ $? -eq 5 ]", release: "pytest -q -m smoke", checkScript: null };
  const types = stack === "ts-vite" ? "tsc -b" : "tsc --noEmit";
  return {
    task: "npm run check",
    merge: "npm run build && npm run test:e2e",
    release: "npm run lighthouse && npm run test:smoke",
    checkScript: tier === "T1" ? `eslint . && ${types} && npm run build` : `eslint . && ${types} && vitest run --passWithNoTests`,
  };
}

function systemPlan(repo, d, opts) {
  const vars = {
    TIER: opts.tier, SINCE: opts.since, KIT_VERSION: opts.kitVersion, APP_NAME: slug(basename(repo)),
    SERVICES: d.children.map((c) => `- \`${c}/\`: see \`${c}/AGENTS.md\``).join("\n"),
  };
  const create = [];
  const merge = [];
  for (const [path, from] of [["AGENTS.md", "templates/AGENTS.system.md"], ["CLAUDE.md", "templates/CLAUDE.md"]]) {
    if (existsSync(join(repo, path))) merge.push(path);
    else create.push({ path, from: src(from) });
  }
  if (existsSync(join(repo, ".gitignore"))) merge.push(".gitignore");
  else create.push({ path: ".gitignore", content: d.children.map((c) => `/${c}/`).join("\n") + "\n" });
  const notes = [];
  if (!d.git) notes.push("This system folder has no git repo: propose `git init` here (forced stop). The child repos stay separate and are ignored.");
  notes.push(`Then run adopt in each child: ${d.children.join(", ")}.`);
  return { create, merge, notes, vars };
}

export function planAdopt(repo, opts) {
  const d = detectStack(repo);
  if (d.children.length) return systemPlan(repo, d, opts);
  if (!d.stacks.length) throw new Error(`no stack detected in ${repo}: expected package.json with next or vite, or pyproject.toml / requirements.txt`);
  const stack = d.stacks[0];
  const checks = defaultChecks(stack, opts.tier);
  const pkg = readPackage(repo);
  const appName = slug(pkg?.name ?? basename(repo));
  const vars = {
    TIER: opts.tier, SINCE: opts.since, KIT_VERSION: opts.kitVersion, PROFILE: opts.profile, STACK: stack, APP_NAME: appName,
    CHECK_TASK: checks.task, CHECK_MERGE: checks.merge, CHECK_RELEASE: checks.release,
    DEV_PORT: stack === "ts-vite" ? "5173" : "3000",
  };
  const t2 = opts.tier !== "T1";
  const files = [
    ["AGENTS.md", "templates/AGENTS.md"],
    ["CLAUDE.md", "templates/CLAUDE.md"],
    ["CODING_STANDARDS.md", "templates/CODING_STANDARDS.md"],
    ["CHANGELOG.md", "templates/CHANGELOG.md"],
    ["scripts/kit/check-agents.mjs", "presets/common/check-agents.mjs"],
    ["scripts/kit/check-spec.mjs", "presets/common/check-spec.mjs"],
    [".githooks/pre-commit", "presets/common/pre-commit"],
  ];
  const ts = stack !== "python";
  if (ts) {
    const appDir = existsSync(join(repo, "src", "app")) ? "src/app" : "app";
    files.push(
      ["eslint.kit.mjs", "presets/ts-web/eslint.kit.mjs"],
      ["tsconfig.kit.json", "presets/ts-web/tsconfig.kit.json"],
      [".github/workflows/ci.yml", t2 ? "presets/ts-web/ci.t2.yml" : "presets/ts-web/ci.t1.yml"],
      ["playwright.config.ts", "presets/ts-web/playwright.config.ts"],
      ["e2e/states.spec.ts", "presets/ts-web/e2e/states.spec.ts"],
      ["e2e/smoke.spec.ts", "presets/ts-web/e2e/smoke.spec.ts"],
      stack === "ts-next" ? [`${appDir}/(dev)/states/page.tsx`, "templates/states/next-page.tsx"] : ["src/dev/States.tsx", "templates/states/vite-states.tsx"],
    );
  } else {
    files.push(["ruff.toml", "presets/python/ruff.toml"], ["pyrightconfig.json", "presets/python/pyrightconfig.json"], [".github/workflows/ci.yml", "presets/python/ci.yml"]);
    if (opts.tier === "T3") files.push(["docs/experiments/TEMPLATE.md", "presets/python/EXPERIMENT.md"]);
  }
  if (t2) files.push([`.claude/skills/verify-${appName}/SKILL.md`, "templates/verify-app/SKILL.md"], [`.claude/skills/verify-${appName}/features/README.md`, "templates/verify-app/features/README.md"]);

  const create = [];
  const merge = [];
  for (const [path, from] of files) (existsSync(join(repo, path)) ? merge.push(path) : create.push({ path, from: src(from) }));
  const eslintConfig = d.existing.find((f) => f.startsWith("eslint.config."));
  if (ts && eslintConfig) merge.push(eslintConfig);
  else if (ts) create.push({ path: "eslint.config.mjs", from: src("presets/ts-web/eslint.config.mjs") });

  const notes = [];
  if (!d.git) notes.push("No git repo: propose `git init` (forced stop). Pre-commit and CI need git.");
  notes.push("Enable the pre-commit hook: `git config core.hooksPath .githooks`.");
  if (ts) {
    const scripts = { check: checks.checkScript, "test:e2e": "playwright test e2e/states.spec.ts", "test:smoke": "playwright test e2e/smoke.spec.ts", lighthouse: "lhci autorun" };
    const missing = Object.entries(scripts).filter(([k, v]) => pkg?.scripts?.[k] !== v);
    if (missing.length) {
      merge.push("package.json#scripts");
      notes.push(`Add to package.json scripts: ${missing.map(([k, v]) => `"${k}": "${v}"`).join(", ")}.`);
    }
    const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
    const need = ["@playwright/test", "@axe-core/playwright", "@lhci/cli", ...(t2 ? ["vitest"] : []), ...(deps["eslint-config-next"] || deps["typescript-eslint"] ? [] : ["eslint", "typescript-eslint"])].filter((p) => !deps[p]);
    if (need.length) notes.push(`Dev dependencies to propose (forced stop: new dependencies): ${need.join(" ")}.`);
    notes.push(deps["eslint-config-next"]
      ? 'In eslint.config.mjs add `import { rulesOnly } from "./eslint.kit.mjs";` and spread `...rulesOnly` after the Next config (it already registers typescript-eslint).'
      : 'In eslint.config.mjs add `import kit from "./eslint.kit.mjs";` and spread `...kit`.');
    notes.push('Extend tsconfig.json with the options in tsconfig.kit.json (or add "extends": "./tsconfig.kit.json").');
    if (stack === "ts-vite") notes.push("Mount `States` from src/dev/States.tsx in main.tsx when `showStates` is true.");
    notes.push("Before the first UI ticket, run the design session to write DESIGN.md.");
  } else {
    notes.push("Dev dependencies to propose (forced stop: new dependencies): ruff pyright pytest.");
  }
  if (d.existing.length) notes.push(ts ? "Ratchet baseline after installing dependencies: `npx eslint . --suppress-all`." : "Ratchet baseline after installing dependencies: `ruff check . --add-noqa`.");
  notes.push("Tell the user to run `/setup-matt-pocock-skills` once in this repo (issue tracker: local markdown in `.scratch/` is the default for solo repos).");
  if (d.github) notes.push("Branch protection (the user applies it in GitHub settings): require the `ci` check on main and block merging red PRs.");
  return { create, merge, notes, vars };
}
