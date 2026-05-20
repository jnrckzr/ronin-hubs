import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", ".output", ".vinxi", "**/*.css"],
  },

  // Recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  sonarjs.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      security,
      sonarjs,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "@typescript-eslint/no-unused-vars": "off",

      // Optional SonarJS overrides
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-duplicate-string": "off",

      // Optional Security overrides
      "security/detect-object-injection": "off",
    },
  },

  eslintPluginPrettier,
);