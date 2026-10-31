import "dotenv/config";
import { test as base, expect, request, APIRequestContext } from "@playwright/test";
import { DevicesPage } from "../pages/DevicesPage";
import { requireEnv } from "./env";

type Fixtures = {
  /** API client that is already signed in (Authorization header set). */
  authedApi: APIRequestContext;
  /** Devices page object, signed in through the UI and showing the device list. */
  devicesPage: DevicesPage;
};

const BASE_URL = process.env.BASE_URL ?? "https://qa-sample-samir.up.railway.app";

export const test = base.extend<Fixtures>({
  authedApi: async ({}, use) => {
    const anon = await request.newContext({ baseURL: BASE_URL });
    const res = await anon.post("/api/auth/signin", {
      data: { email: requireEnv("QA_EMAIL"), password: requireEnv("QA_PASSWORD") },
    });
    expect(res.ok(), "sign-in should succeed").toBeTruthy();
    const body = await res.json();
    const token = body.token ?? body.accessToken ?? body.jwt;
    expect(token, "sign-in response should contain a token").toBeTruthy();
    await anon.dispose();

    const api = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    await use(api);
    await api.dispose();
  },

  devicesPage: async ({ page }, use) => {
    const devices = new DevicesPage(page);
    await devices.goto();
    await devices.signIn(requireEnv("QA_EMAIL"), requireEnv("QA_PASSWORD"));
    await devices.expectOnPage(1);
    await use(devices);
  },
});

export { expect };
