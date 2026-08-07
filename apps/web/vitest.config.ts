import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Frontend unit tests for the Fase 8 explainable-quality / inference-transparency
// components. Runs under the same Node versions as CI (20 / 22).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirror the tsconfig `@/*` -> `./*` path alias so component imports resolve.
    alias: {
      "@": path.resolve(process.cwd(), "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
  },
});
