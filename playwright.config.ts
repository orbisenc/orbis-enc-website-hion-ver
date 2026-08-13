import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["./tests/e2e/completion-reporter.ts"]],
  use: { baseURL: "http://127.0.0.1:3000", trace: "retain-on-failure", channel: "chrome" },
  projects: [
    { name: "모바일", use: { ...devices["Pixel 5"] } },
    { name: "데스크톱", use: { ...devices["Desktop Chrome"] } },
  ],
});
