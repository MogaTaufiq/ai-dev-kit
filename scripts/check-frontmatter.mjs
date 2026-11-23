import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ALLOWED = new Set(["name", "description", "when_to_use", "license", "compatibility", "metadata", "allowed-tools", "disable-model-invocation"]);
const MAX_DESC = 1536;
const MAX_BODY_LINES = 500;

export function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { error: "missing frontmatter" };
  const fields = {};
  const errors = [];
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (!kv) {
      errors.push(`frontmatter line is not a single-line "key: value": ${line.trim().slice(0, 40)}`);
      continue;
    }
    fields[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { fields, body: m[2], errors };
}

export function checkSkill(dir) {
  const file = join(dir, "SKILL.md");
  if (!existsSync(file)) return [`${dir}: SKILL.md missing`];
  const { fields, body, errors = [], error } = parseFrontmatter(readFileSync(file, "utf8"));
  if (error) return [`${file}: ${error}`];
  const out = errors.map((e) => `${file}: ${e}`);
  for (const key of Object.keys(fields)) if (!ALLOWED.has(key)) out.push(`${file}: key "${key}" not allowed`);
  if (fields.name !== basename(dir)) out.push(`${file}: name "${fields.name}" must equal dir name "${basename(dir)}"`);
  if (!fields.description) out.push(`${file}: description missing`);
  const descLen = (fields.description ?? "").length + (fields.when_to_use ?? "").length;
  if (descLen > MAX_DESC) out.push(`${file}: description + when_to_use is ${descLen} chars, max ${MAX_DESC}`);
  const lines = body.split("\n").length;
  if (lines >= MAX_BODY_LINES) out.push(`${file}: body is ${lines} lines, must be under ${MAX_BODY_LINES}`);
  for (const [, target] of body.matchAll(/\]\(([^)#\s]+\.md)\)/g)) {
    if (/^[a-z]+:/i.test(target)) continue;
    if (!existsSync(join(dir, target))) out.push(`${file}: broken link ${target}`);
  }
  const yaml = join(dir, "agents", "openai.yaml");
  if (!existsSync(yaml)) out.push(`${dir}: agents/openai.yaml missing`);
  else if (fields["disable-model-invocation"] === "true" && !/allow_implicit_invocation:\s*false/.test(readFileSync(yaml, "utf8"))) {
    out.push(`${yaml}: user-invoked skill needs policy.allow_implicit_invocation: false`);
  }
  return out;
}

export function checkPlugin(root) {
  const manifest = join(root, ".claude-plugin", "plugin.json");
  if (!existsSync(manifest)) return [`${manifest} missing`];
  const listed = (JSON.parse(readFileSync(manifest, "utf8")).skills ?? []).map((p) => resolve(root, p)).sort();
  const skillsDir = join(root, "skills");
  const actual = existsSync(skillsDir)
    ? readdirSync(skillsDir).map((d) => join(skillsDir, d)).filter((p) => statSync(p).isDirectory()).map((p) => resolve(p)).sort()
    : [];
  const out = [];
  for (const p of actual) if (!listed.includes(p)) out.push(`plugin.json skills array is missing ${p}`);
  for (const p of listed) if (!actual.includes(p)) out.push(`plugin.json lists ${p}, which is not a dir under skills/`);
  for (const p of actual) out.push(...checkSkill(p));
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkPlugin(resolve(process.argv[2] ?? "."));
  for (const e of errors) console.error(e);
  process.exit(errors.length ? 1 : 0);
}
