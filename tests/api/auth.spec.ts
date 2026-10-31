import { test, expect, request } from "@playwright/test";
import "dotenv/config";
import { requireEnv } from "../../fixtures/env";

const BASE_URL = process.env.BASE_URL ?? "https://qa-sample-samir.up.railway.app";

test.describe("Auth API", () => {
  test("valid credentials return a token", async () => {
    const api = await request.newContext({ baseURL: BASE_URL });
    const res = await api.post("/api/auth/signin", {
      data: { email: requireEnv("QA_EMAIL"), password: requireEnv("QA_PASSWORD") },
    });
    expect(res.ok(), `sign-in failed with ${res.status()}`).toBeTruthy();
    const body = await res.json();
    expect(body.token ?? body.accessToken ?? body.jwt, "response should contain a token").toBeTruthy();
    await api.dispose();
  });

  test("wrong password is rejected with a 4xx and no token", async () => {
    const api = await request.newContext({ baseURL: BASE_URL });
    const res = await api.post("/api/auth/signin", {
      data: { email: requireEnv("QA_EMAIL"), password: "definitely-not-the-password" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
    const text = await res.text();
    expect(text).not.toMatch(/"(token|accessToken|jwt)"\s*:/);
    await api.dispose();
  });
});
