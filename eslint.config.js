import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import reactCompiler from "eslint-plugin-react-compiler";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-compiler": reactCompiler,
      "react-hooks": reactHooksPlugin,
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // External packages come first.
            ["^@?\\w"],
            // Aliased internal packages.
            ["^@/"],
            // Internal packages.
            ["^\\.\\./", "^\\./"],
            // Side effect imports.
            ["^\\u0000"],
            // Other relative imports. Put same-folder imports and `.` last.
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports.
            ["^.+\\.?(css)$"],
          ],
        },
      ],

      // Shared rules for both client and server
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // React specific rules
      "react-compiler/react-compiler": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
