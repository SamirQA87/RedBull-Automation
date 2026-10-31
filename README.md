# QA Automation: Devices app (API + UI)

Playwright + TypeScript regression tests for the Devices app. Two layers:

- **API tests** (`tests/api`) use Playwright's request API, with no browser.
- **UI tests** (`tests/ui`) drive the app in Chromium through a page object.

## What it covers

| Test | Type | Status |
|------|------|--------|
| Sign-in returns a token for valid credentials | API | stable |
| Sign-in rejects a wrong password with a 4xx and no token | API | stable |
| Command to an OFFLINE device returns a clear 4xx, no stack trace (**bug #16**) | API | `@known-bug` |
| Changing a filter resets pagination to page 1 (**bug #12**) | UI | `@known-bug` |

**Known-bug tests** assert the *correct* behaviour, so they FAIL while the bug exists and the failure is the evidence. They PASS once the bug is fixed, which makes them regression tests. They are tagged `@known-bug` so they run separately from the stable suite.

- Bug #16: the endpoint returns 500 with a stack trace instead of a 4xx.
- Bug #12: changing a filter keeps the old page number, giving an empty list such as "Page 6 of 3".

## Setup

    npm install
    npx playwright install chromium
    cp .env.example .env        # Windows: copy .env.example .env, then fill in the values

## Run

    npm run test:stable         # gating suite, should be green
    npm run test:known-bugs     # reproduces the open bugs, red until they are fixed
    npm test                    # everything
    npm run report              # open the HTML report
    npm run typecheck

## Design notes

- **Fixtures** (`fixtures/`): `authedApi` signs in once per test and returns an authenticated API client; `devicesPage` returns a signed-in page object. Tests start at the behaviour under test.
- **Page Object** (`pages/DevicesPage.ts`): locators and actions for sign-in, pagination and filters live in one place.
- **No hard sleeps.** Waiting relies on Playwright auto-waiting and web-first assertions.
- **No secrets in the repo.** Credentials come only from `.env` (git-ignored). The tests fail with a clear message if a variable is missing.
- **CI** (`.github/workflows/tests.yml`): the stable suite gates the build; known-bug tests run in a separate, non-blocking job. Set `QA_EMAIL`, `QA_PASSWORD` and `OFFLINE_DEVICE_ID` as repository secrets.
