import "dotenv/config";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://qa-sample-samir.up.railway.app";
const EMAIL = process.env.QA_EMAIL ?? "qa.tester@example.com";
const PASSWORD = process.env.QA_PASSWORD ?? "Password123";

/**
 * Bug #12 — Changing a filter does not reset pagination.
 * Steps: go to a later page, then apply the Offline filter.
 * Expected: results reset to page 1 ("Page 1 of ...").
 * Actual: the page number is kept, producing an empty list like "Page 6 of 3".
 * This test asserts the correct behaviour, so it FAILS while the bug exists
 * and will PASS once #12 is fixed (regression test).
 */
test("changing a filter resets pagination to page 1 (bug #12)", async ({ page }) => {
  // 1. Sign in
  await page.goto(BASE);
  await page.getByTestId("signin-email-input").fill(EMAIL);
  await page.getByTestId("signin-password-input").fill(PASSWORD);
  await page.getByTestId("signin-submit-button").click();

  // 2. Wait for the Devices list to load (page indicator visible)
  const pageInfo = page.locator(".pagination-info");
  await expect(pageInfo).toContainText("Page 1 of");

  // 3. Click Next a few times to reach a later page
  const nextButton = page.getByRole("button", { name: "Next" });
  for (let i = 0; i < 6; i++) {
    await nextButton.click();
    await page.waitForTimeout(400); // small pause so the demo is followable
  }
    await expect(pageInfo).toContainText("Page 7 of"); // now on a later page 

  // 4. Apply the Offline status filter
  await page.getByTestId("filter-presence-status").selectOption("offline");
  await page.waitForTimeout(600);

  // 5. Correct behaviour: the list should jump back to page 1
  await expect(
    pageInfo,
    "after changing a filter the list should reset to page 1"
  ).toContainText("Page 1 of");
});