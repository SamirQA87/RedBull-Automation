import { test, expect } from "../../fixtures";
import { requireEnv } from "../../fixtures/env";

/** Matches typical stack-trace content: "at fn (file.js:12:34)", "node_modules", or a "stack" field. */
const STACK_TRACE = /\bat\s+[^\n(]+\([^)\n]*:\d+:\d+\)|node_modules|"stack"|\bstack\s*trace\b/i;

/**
 * Bug #16: a command sent to an OFFLINE device should return a clear 4xx.
 * The endpoint currently returns 500 with a stack trace, so this test FAILS by design.
 * Tagged @known-bug so CI can run it separately from the stable suite.
 */
test(
  "offline-device command is rejected with a clear 4xx (bug #16)",
  { tag: "@known-bug" },
  async ({ authedApi }) => {
    const res = await authedApi.post("/api/devices/command", {
      data: {
        devices: [requireEnv("OFFLINE_DEVICE_ID")],
        command_name: "update_core_services",
        params: { command_version: "6.4.10" },
      },
    });

    const status = res.status();
    const bodyText = await res.text();

    expect(status, `expected a 4xx, got ${status} with body: ${bodyText}`).toBeGreaterThanOrEqual(400);
    expect(status, `expected a 4xx, got ${status} (500 = unhandled server error)`).toBeLessThan(500);
    expect(bodyText, "error response should not leak a stack trace").not.toMatch(STACK_TRACE);
  },
);
