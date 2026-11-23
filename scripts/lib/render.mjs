export function render(text, vars) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (_, name) => {
    if (vars[name] == null) throw new Error(`unfilled placeholder: ${name}`);
    return vars[name];
  });
}
