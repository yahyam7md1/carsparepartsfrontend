import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const shopImportRestriction = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@/admin", "@/admin/*", "@/admin/**"],
          message:
            "Shop code must not import from the admin silo. Use @/shared for cross-cutting code.",
        },
      ],
    },
  ],
};

const adminImportRestriction = {
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["@/shop", "@/shop/*", "@/shop/**"],
          message:
            "Admin code must not import from the shop silo. Use @/shared for cross-cutting code.",
        },
      ],
    },
  ],
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["src/shop/**/*.{ts,tsx}", "src/app/[locale]/(shop)/**/*.{ts,tsx}"],
    rules: shopImportRestriction,
  },
  {
    files: ["src/admin/**/*.{ts,tsx}", "src/app/(admin)/**/*.{ts,tsx}"],
    rules: adminImportRestriction,
  },
];

export default eslintConfig;
