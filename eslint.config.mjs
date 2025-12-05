import nextConfig from "eslint-config-next";

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
  ...nextConfig,
];

export default eslintConfig;
