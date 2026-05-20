import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/app.ts",
        "src/common/**/*.ts",
        "src/modules/auth/**/*.ts",
        "src/modules/analytics/date-helpers.ts",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/common/audit/index.ts",
        "src/common/auth/auth.types.ts",
        "src/config/env.ts",
        "src/lib/prisma.ts",
        "src/modules/index.ts",
        "src/scripts/**",
        "src/server.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
})
