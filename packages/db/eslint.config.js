//  @ts-check

import importPlugin from "eslint-plugin-import-x";

export default [
  {
    ignores: ["node_modules/**", "migrations/**", "drizzle.config.ts"],
  },
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "@riverly/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "sort-imports": "off",
      "import/consistent-type-specifier-style": "off",
      "@typescript-eslint/array-type": "off",
      "@stylistic/spaced-comment": "off",
      "@stylistic/comma-dangle": "off",
      "@stylistic/quotes": "off",
      "@stylistic/semi": "off",
      "@stylistic/indent": "off",
      "@stylistic/object-curly-spacing": "off",
      "@stylistic/arrow-parens": "off",
      "@stylistic/space-before-function-paren": "off",
      "@stylistic/max-len": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "no-console": "off",
      "prefer-const": "off",
      "no-shadow": "off",
    },
  },
];
