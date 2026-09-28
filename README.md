<img width="2160" height="2700" alt="QE_Agentic_Playwright_LinkedIn" src="https://github.com/user-attachments/assets/c4a32acc-a962-433f-8734-0cb0ac5df241" />
# QE Agentic Playwright — SauceDemo

An AI-native Playwright TypeScript automation framework for [SauceDemo](https://www.saucedemo.com),
built around a Page Object Model, fixture-based dependency injection, and a library of
Claude Code skills (`.claude/skills/`) that enforce consistent conventions and a human-approval
gate before any test code is generated.

This repo is designed to be driven by an AI coding agent (Claude Code) using the rules in
[CLAUDE.md](CLAUDE.md) and the skills under `.claude/skills/`, but every generated artifact is
plain, readable Playwright/TypeScript that runs the same way with or without the agent.

## Tech Stack

- [Playwright](https://playwright.dev/) + TypeScript
- [Allure](https://allurereport.org/) for rich HTML test reporting
- Docker / Docker Compose for containerized runs
- GitHub Actions and Jenkins pipelines for CI/CD across `dev` / `qa` / `stage` / `prod`

## Project Structure

```
pages/{area}/          -- Page objects (Page Object Model)
pages/components/      -- Reusable UI components
tests/{area}/functional/   -- Functional tests (one behavior in isolation)
tests/{area}/e2e/          -- End-to-end tests (full user journeys)
test-data/factories/{area}/ -- Faker-based dynamic happy-path data
test-data/static/{area}/    -- Curated static TS data (as const, never JSON)
test-scenarios/{area}/      -- Approved test-case matrices (Excel, human-reviewed)
fixtures/pom/           -- Page object fixtures + the single test/expect import point
fixtures/helper/        -- Setup/teardown fixtures (auth, etc.)
enums/{area}/           -- Routes, UI messages, and other app-specific constants
enums/util/             -- Shared enums (roles, storage-state paths)
config/                 -- Environment/config objects (URLs, env-driven settings)
helpers/{area}/         -- App-specific helper functions
helpers/util/           -- Generic utility helpers
env/                    -- Per-environment .env files (.env.dev, .env.qa, ...)
.claude/skills/         -- AI agent skills: rules, patterns, and reusable prompt templates
```

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop (only needed for containerized runs — see [Running with Docker](#running-with-docker))

## Setup

```bash
npm install
npx playwright install --with-deps chromium
```

Create your environment file(s) under `env/` (see `env/.env.dev`, `env/.env.qa` for existing
examples) with:

```
APP_URL=https://www.saucedemo.com
APP_USERNAME=standard_user
APP_PASSWORD=secret_sauce
```

`ENVIRONMENT` selects which `env/.env.*` file `playwright.config.ts` loads — see the `config`
skill for details.

## Running Tests

```bash
npm test                                  # full suite
npx playwright test [file]                # a single spec file
npx playwright test --grep @smoke         # by tag
npx playwright test --ui                  # UI Mode
```

Every test carries exactly one tag: `@smoke` | `@sanity` | `@regression` | `@e2e` | `@destructive`.

## Reports

```bash
npm run allure:generate   # build the Allure report from allure-results/
npm run allure:open       # serve and open it locally (Allure reports must be served, not
                           # opened as a file:// URL — browsers block the JS that renders them)
npm run allure:serve      # generate + serve in one step
```

## Running with Docker

```bash
npm run docker:dev   # smoke tests against env/.env.dev, then opens the Allure report
npm run docker:qa    # full suite against env/.env.qa, then opens the Allure report
```

See [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml).

## CI/CD

- **GitHub Actions** — [.github/workflows/playwright-pipeline.yml](.github/workflows/playwright-pipeline.yml).
  Manually triggered (`workflow_dispatch`), runs lint/typecheck → smoke on Dev → full suite on
  QA → smoke on Stage → smoke on Prod, gated by the chosen `environment` input. Each stage
  publishes its Allure report to GitHub Pages with a direct link in the job summary.
- **Jenkins** — [Jenkinsfile](Jenkinsfile). Same environment-gated pipeline, built and run via
  Docker, publishing both Playwright HTML and Allure reports through the HTML Publisher plugin.

Both pipelines read `APP_URL` / `APP_USERNAME` / `APP_PASSWORD` from CI secrets/credentials —
never commit real credentials to `env/`.

### Example: generating test cases from a Jira ticket

The `jira-test-cases` skill turns a Jira ticket's acceptance criteria into a QA-reviewable Excel
test-case matrix (`Title | Preconditions | Steps | Expected Result | Test Data | Type`), saved to
`test-scenarios/{area}/{summary}_testcases.xlsx` for human review before any automation is
written. See [test-scenarios/swaglabs/](test-scenarios/swaglabs/) for real examples already in
this repo.
[`.claude/skills/jira-test-cases/references/test-case-generator.md`](.claude/skills/jira-test-cases/references/test-case-generator.md).


Once a test-case file like that is approved, `.claude/skills/test-standards/references/automation-generator-prompt.md`
is the companion prompt that turns it into automated Playwright tests — mapping each row to a
spec file, tag, and page-object/data work, then stopping for a second human approval (the
`ai-native-workflow` Phase 4 confidence-gate) before any code is generated.


## Environments

| Environment | Test scope |
| ----------- | ---------- |
| `dev`       | `@smoke` only |
| `qa`        | full suite |
| `stage`     | `@smoke` only | --> can be changed based on tag
| `prod`      | `@smoke` only | --> can be changed based on tag

<img width="2160" height="2700" alt="QE_Agentic_Playwright_LinkedIn" src="https://github.com/user-attachments/assets/edf029f2-7d3a-4dde-bab8-cc03e25b46db" />

