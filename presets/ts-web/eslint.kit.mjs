import tseslint from "typescript-eslint";

const RAW_HEX = String.raw`/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/`;
const ARBITRARY = String.raw`/(^|\s)[!a-z0-9:-]+-\[[^\]]+\](\s|$)/`;

export const rulesOnly = [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },
  {
    files: ["**/lib/**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/consistent-type-assertions": "off" },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Property > Literal[value=${RAW_HEX}]`, message: "Raw hex color: use a DESIGN.md token (CSS variable) instead." },
        { selector: `JSXAttribute[name.name!='href'] > Literal[value=${RAW_HEX}]`, message: "Raw hex color: use a DESIGN.md token (CSS variable) instead." },
        { selector: `Literal[value=${ARBITRARY}]`, message: "Arbitrary Tailwind value: add a token to DESIGN.md and use its class." },
      ],
    },
  },
];

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@typescript-eslint": tseslint.plugin },
  },
  ...rulesOnly,
];
