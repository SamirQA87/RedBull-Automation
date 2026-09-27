import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://qa-sample-samir.up.railway.app",
    viewport: { width: 1280, height: 800 },
    trace: "on",
    launchOptions: { slowMo: 2000 },
  },
});