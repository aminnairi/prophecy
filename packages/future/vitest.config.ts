import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    css: false,
    exclude: ["postcss.config.ts"],
    coverage: {
      enabled: true,
      reporter: ['text'],
    },
  },
});