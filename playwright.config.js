import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  reporter: "list",
  use: {
    baseURL: "http://localhost:8081",
    permissions: [],
  },
  webServer: {
    command: "npx http-server -p 8081 -c-1 -s",
    url: "http://localhost:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
