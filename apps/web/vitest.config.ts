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
  // Tests do not import CSS, and the project's Tailwind v4 PostCSS plugin (loaded
  // by Vite from postcss.config.mjs) is unnecessary here. Provide an empty inline
  // PostCSS config so Vitest does not initialize Tailwind during the run.
  css: {
    postcss: {
      plugins: [],
    },
  },
});
