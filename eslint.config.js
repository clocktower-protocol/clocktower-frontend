import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: { 
      js,
      "react": pluginReact,
      "react-hooks": pluginReactHooks
    },
    extends: ["js/recommended"],
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
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed in Vite projects
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  pluginReact.configs.flat.recommended
]);
