import { defineConfig } from "vitest/config";

// Plain Node test environment. These tests cover pure-TypeScript modules
// (parser, search, SSRF guard) and don't need the Workers runtime. For
// Worker-integration tests we would add @cloudflare/vitest-pool-workers
// as a separate `workers` project.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
