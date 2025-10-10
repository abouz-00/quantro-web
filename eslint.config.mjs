import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "coverage-landing/**",
      "*.min.js",
      "public/**",
      "prisma/migrations/**",
      "quantro-backend/generated/**",
      "quantro-backend/prisma/generated/**",
      "**/generated/prisma/**",
      "test.db",
      "dev.db",
      "next-env.d.ts",
      "scripts/**",
      "**/test-*.js"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
