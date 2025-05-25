import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs["jsx-runtime"].rules,
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      "no-unused-vars": ["error", {
        "varsIgnorePattern": "^[A-Z]",
        "argsIgnorePattern": "^_"
      }]
    }
  }
]);
