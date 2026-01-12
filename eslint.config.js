import js from "@eslint/js";
import typescript from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    files: ["**/*.tsx", "examplesapp/src/**/*.tsx"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  {
    files: ["**/*.ts", "**/*.tsx", "examplesapp/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescript.parser,
      parserOptions: {
        project: ["./tsconfig.json", "./tests/tsconfig.json", "./examplesapp/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2023,
        sourceType: "module"
      }
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    }
  },
  {
    ignores: [
      "dist/",
      "docs/",
      "examplesapp/dist/",
      "examplesapp/src/examples/",
      "examplesapp/vite.config.ts",
      "jest.config.js",
      "rollup.config.js",
      "node_modules/"
    ]
  }
];
