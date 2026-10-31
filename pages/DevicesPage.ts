import { Page, Locator, expect } from "@playwright/test";

export class DevicesPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly pageInfo: Locator;
  readonly nextButton: Locator;
  readonly presenceFilter: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByTestId("signin-email-input");
    this.password = page.getByTestId("signin-password-input");
    this.submit = page.getByTestId("signin-submit-button");
    this.pageInfo = page.locator(".pagination-info");
    this.nextButton = page.getByRole("button", { name: "Next" });
    this.presenceFilter = page.getByTestId("filter-presence-status");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Asserts the pagination indicator shows the given page number, e.g. "Page 3 of". */
  async expectOnPage(pageNumber: number): Promise<void> {
    await expect(this.pageInfo).toContainText(`Page ${pageNumber} of`);
  }

  /** Clicks Next the given number of times, waiting for the indicator to update after each click. */
  async goForward(times: number, startingPage = 1): Promise<number> {
    let current = startingPage;
    for (let i = 0; i < times; i++) {
      await this.nextButton.click();
      current += 1;
      await this.expectOnPage(current);
    }
    return current;
  }

  async filterByPresence(status: "online" | "offline"): Promise<void> {
    await this.presenceFilter.selectOption(status);
  }
}
