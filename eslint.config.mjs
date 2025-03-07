import path from "node:path";
import { fileURLToPath } from "node:url";

import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import noOnlyTests from "eslint-plugin-no-only-tests";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/dist/"],
  },
  ...compat.extends("prettier", "plugin:prettier/recommended"),
  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2020,
    },
  },
  {
    plugins: {
      "no-only-tests": noOnlyTests,
    },

    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "prefer-const": [
        "error",
        {
          destructuring: "all",
        },
      ],

      "no-constant-binary-expression": "error",
      "no-cond-assign": "error",
      "no-constant-condition": "error",
      "no-sequences": "error",
      curly: ["error", "all"],
      "no-only-tests/no-only-tests": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],

    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      ecmaVersion: 2020,
    },

    rules: {
      // need to turn off the basic rule so we can use the typescript rule
      // instead
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
    },
  },
];
