import "dotenv/config";
import { test, expect, request } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://qa-sample-samir.up.railway.app";

async function getToken(): Promise<string> {
  const api = await request.newContext({ baseURL: BASE });
  const res = await api.post("/api/auth/signin", {
    data: { email: process.env.QA_EMAIL, password: process.env.QA_PASSWORD },
  });
  expect(res.ok(), "sign-in should succeed").toBeTruthy();
  const body = await res.json();
  const token = body.token ?? body.accessToken ?? body.jwt;
  expect(token, "sign-in response should contain a token").toBeTruthy();
  return token as string;
}

test("offline-device command is rejected with a clear 4xx (bug #16)", async () => {
  const token = await getToken();
  const api = await request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await api.post("/api/devices/command", {
    data: {
      devices: [process.env.OFFLINE_DEVICE_ID],
      command_name: "update_core_services",
      params: { command_version: "6.4.10" },
    },
  });

  const status = res.status();
  const bodyText = await res.text();

  expect(status, `expected a 4xx, got ${status} with body: ${bodyText}`).toBeGreaterThanOrEqual(400);
  expect(status, `expected a 4xx, got ${status} (500 = unhandled server error)`).toBeLessThan(500);
  expect(bodyText, "error response should not contain a stack trace").not.toContain("stack");
});