import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules", "storybook-static", "coverage"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,

      // React refresh rule
      "react-refresh/only-export-components": "warn",

      // React specific overrides
      "react/prop-types": "off", // TypeScript handles this
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform

      // General rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
    },
  },
  {
    files: ["**/*.stories.{js,jsx,ts,tsx}"],
    plugins: {
      storybook,
    },
    rules: {
      ...storybook.configs.recommended.rules,
      "storybook/hierarchy-separator": "error",
      "storybook/default-exports": "error",
    },
  },
  {
    files: [
      "**/*.{test,spec}.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
