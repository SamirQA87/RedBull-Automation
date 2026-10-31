import { test } from "../../fixtures";

/**
 * Bug #12: changing a filter does not reset pagination.
 * Steps: go to a later page, then apply the Offline filter.
 * Expected: results reset to page 1 ("Page 1 of ...").
 * Actual: the page number is kept, producing an empty list like "Page 6 of 3".
 *
 * Asserts the correct behaviour, so it FAILS while the bug exists and will PASS
 * once #12 is fixed. Tagged @known-bug so CI can run it separately from the stable suite.
 */
test(
  "changing a filter resets pagination to page 1 (bug #12)",
  { tag: "@known-bug" },
  async ({ devicesPage }) => {
    const laterPage = await devicesPage.goForward(6);
    await devicesPage.expectOnPage(laterPage);

    await devicesPage.filterByPresence("offline");

    // Web-first assertion: retries until the indicator updates or the timeout hits.
    await devicesPage.expectOnPage(1);
  },
);
