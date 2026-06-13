import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // server-only's default export always throws; map it to the no-op
      // empty.js so Vitest can import server-only modules in tests.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
});
