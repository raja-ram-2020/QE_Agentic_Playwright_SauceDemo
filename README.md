<img width="2160" height="2700" alt="QE_Agentic_Playwright_LinkedIn" src="https://github.com/user-attachments/assets/c4a32acc-a962-433f-8734-0cb0ac5df241" />

# QE Agentic Playwright

An AI-native Playwright TypeScript automation framework,
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

## AI-Assisted Test Case Generation and Automation

This repo ships a two-stage, human-gated pipeline that turns a Jira ticket into automated
Playwright tests. Each stage produces a reviewable artifact and stops for **explicit human
approval** before continuing — no test code is ever generated on an unreviewed guess.

```
Jira ticket ──▶ Stage 1: Test-case matrix (.xlsx) ──▶ [Human approval] ──▶ Stage 2: Playwright tests ──▶ [Human approval] ──▶ Stage 3: Verify
```

### Stage 1 — Generate test cases from a Jira ticket

Ask Claude Code, e.g. *"Generate test cases for PROJ-123"*. This invokes the
[`jira-test-cases`](.claude/skills/jira-test-cases/SKILL.md) skill, which:

1. Fetches the ticket's description and acceptance criteria via the Jira MCP connector — it
   never infers behavior from the ticket title alone, and stops to ask if no usable requirements
   are found.
2. Derives one row per distinct scenario, classified as Positive / Negative / Edge / Boundary /
   Performance, using only the literal values, labels, and messages the ticket actually states.
3. Saves the result as a QA-reviewable Excel file:
   `test-scenarios/{area}/{ticket-summary}_testcases.xlsx`, with columns
   `Title | Preconditions | Steps | Expected Result | Test Data | Type`.
   See [test-scenarios/swaglabs/](test-scenarios/swaglabs/) for real examples already in this repo.
4. **Stops.** It does not begin automation in the same turn.

A portable, tool-agnostic version of this prompt lives at
[`.claude/skills/jira-test-cases/references/test-case-generator.md`](.claude/skills/jira-test-cases/references/test-case-generator.md)
— useful for pasting into another AI tool or for understanding the exact reasoning steps the
skill follows. Inside this repo, invoke the skill directly rather than the raw prompt.

> **Human checkpoint 1:** A QA lead opens the `.xlsx` file and confirms every row traces back to
> a specific line in the ticket. Approve it, or send it back with change requests — automation
> does not start until this is signed off.

### Stage 2 — Automate the approved test cases

Once the `.xlsx` is approved, ask Claude Code, e.g. *"Automate
test-scenarios/swaglabs/login_functionality_testcases.xlsx"*. This runs the companion prompt at
[`.claude/skills/test-standards/references/automation-generator-prompt.md`](.claude/skills/test-standards/references/automation-generator-prompt.md),
which is where this framework's **AI governance and guardrails** are enforced:

1. **Loads every governing skill** for the task — `test-standards`, `page-objects`, `selectors`,
   `fixtures`, `data-strategy`, `enums`, `type-safety`, `playwright-cli`, `common-tasks` — so the
   full [CLAUDE.md](CLAUDE.md) constitution (no XPath, no hard waits, no `any`, single-tag rule,
   mandatory cleanup, etc.) applies automatically to whatever it generates.
2. **Explores the live app first.** Per the constitution's "Explore Before Generate" rule, it
   uses `playwright-cli` to confirm real selectors and routes before writing a single page
   object — it never invents a locator.
3. **Maps every approved row** to a spec file, tag, and the page-object / data-factory / fixture
   work it needs.
4. **Emits an `ai-native-workflow` Phase 4 proposal** — Scope, Trade-offs, Confidence (1–10),
   Rationale, Unknowns — together with a test-case → spec mapping table, and **stops**. A
   confidence score below 5 means it will ask clarifying questions instead of proposing at all.
5. **Only on explicit approval** does it write code. On rejection or change requests, it revises
   the mapping and re-presents rather than proceeding.

> **Human checkpoint 2:** Review the confidence score and the test-case → spec mapping table
> before approving. This is the same gate the `ai-native-workflow` skill enforces for every
> non-trivial change in this repo, not a special case for this pipeline.

### Stage 3 — Verify

Once code is generated, the affected tests are run (`npx playwright test [file]`) and must pass
before the task is considered complete. Any failure routes into the
[`debugging`](.claude/skills/debugging/SKILL.md) skill rather than being suppressed or worked
around.

### Why two separate approval gates?

- **Gate 1** catches a misread requirement before any code exists — the cheapest place to fix it.
- **Gate 2** catches implementation decisions (tags, selectors, page-object design) before
  they're committed to the suite.

Together, they mean every automated test in this repo traces back to an **approved requirement**
and an **approved implementation plan** — never an unreviewed agent guess.

## Environments

| Environment | Test scope |
| ----------- | ---------- |
| `dev`       | `@smoke` only |
| `qa`        | full suite |
| `stage`     | `@smoke` only --> can be changed based on tag | 
| `prod`      | `@smoke` only --> can be changed based on tag |

