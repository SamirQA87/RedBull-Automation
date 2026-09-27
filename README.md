# QA Automation - Devices Command API

Automated regression test for the Devices Command API, written with Playwright (API testing mode).

## What it covers
Bug #16 - a command sent to an OFFLINE device should return a clear 4xx.
The endpoint currently returns 500 with a stack trace, so the test FAILS by design:
the failure is the evidence of the bug. It will pass once #16 is fixed.

## Setup
    npm install
    copy .env.example .env

## Run
    npx playwright test
    npx playwright show-report

## Design notes
- Uses Playwright request API (no browser) - the endpoint is backend-only.
- Signs in automatically to obtain a fresh token; no secrets are committed (.env is git-ignored).
- Asserts the correct behaviour, so the test serves as a regression check after the fix.