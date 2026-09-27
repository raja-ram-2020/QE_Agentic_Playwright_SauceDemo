---
name: helpers
description: Plain utility function conventions for the Playwright framework — app-specific helpers in helpers/{area}/ and generic utilities in helpers/util/ (date formatting, string manipulation, parsing). Use when adding a reusable function that does NOT need the Playwright fixture lifecycle, or deciding whether a reusable piece of code belongs in helpers/ or fixtures/. For Playwright fixtures with setup/use/teardown lifecycle use the fixtures skill; for the env and enum sources of truth see the config and enums skills.
---

# Helpers

## Critical

- **Helpers are plain functions.** No Playwright fixture lifecycle — no `use()`, no `base.extend`. If you need setup → `use(data)` → teardown, it's a **fixture**, not a helper (see the `fixtures` skill).
- **App-specific logic** lives in `helpers/{area}/` (e.g. `helpers/app/`). **Generic utilities** live in `helpers/util/`.
- **ALWAYS** add JSDoc with `@param` and `@returns` on every exported helper.
- **ALWAYS** specify explicit return types (`Promise<void>`, `string`, etc.). No implicit `any`.
- **NEVER** hardcode URLs, credentials, or tokens. Read env-driven values from `process.env.*` (see the `config` skill). Use `enums/{area}/*` for routes.
- **Function naming:** camelCase verbs (`formatDate`, `parseCurrency`, `seedProduct`).
- **Do not promote a helper to a helper fixture** unless the same setup/teardown is copy-pasted across **3+** spec files and needs guaranteed lifecycle (see the `fixtures` skill).
- **No `helpers/` directory exists in this repo yet.** Auth today goes through `resetStorageState` + the login page object per test (see "How this framework handles auth" below) — there is no bootstrap helper to model a new one on. Confirm with `ls helpers/` before assuming a file exists.

## File Locations

> **`{area}` is a placeholder.** Before creating or referencing any path below, run `ls helpers/` to discover the real subdirectory names in this repo (e.g., `front-office`, `back-office`) and use those instead. Neither location has been created yet — the paths below are the naming convention to follow, not existing files.

| Type            | Directory         | Purpose                                                   | Example filename       |
| --------------- | ----------------- | ---------------------------------------------------------- | ----------------------- |
| App helpers     | `helpers/{area}/` | App-specific helper functions (data seeding, request composition) | `helpers/app/seedProduct.ts` |
| Utility helpers | `helpers/util/`   | Generic utility functions reusable across apps/projects   | `helpers/util/util.ts`  |

## How this framework handles auth

There is no auth-bootstrap helper, no `auth.setup.ts`, and no persisted storage-state file in this repo. The real pattern, from `tests/swaglabs/functional/login.spec.ts`:

```typescript
test.beforeEach(async ({ resetStorageState, loginPage }) => {
    await resetStorageState(); // clears cookies + permissions — see the fixtures skill
    await loginPage.open();
});
```

Each test that needs to be logged in calls `loginPage.login(username, password)` itself, inline. There is no separate `StorageStatePaths` enum and no session persisted across tests.

If this suite later needs to skip a real login per test (e.g. for speed on a slow login flow), that would be a **new** capability — an actual `auth.setup.ts` that logs in once and saves `context.storageState({ path })`, a new enum member for the saved-state path, and a Playwright project dependency wiring the setup to run first. Don't write code as if that already exists; propose it as new work and confirm with the human first (see `ai-native-workflow`).

## Instructions

### Phase 1: Classify what you're adding

Use this table. The correct criterion is **"does this need the Playwright fixture lifecycle?"** — not _"is this used in setup or in tests?"_. A plain utility like `formatDate` is a helper even though it's called from inside tests.

| Symptom                                                                                          | Home                                                                                        |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Pure function — no setup/teardown lifecycle needed                                               | **Helper** in `helpers/{area}/` or `helpers/util/`                                          |
| Needs `page` context via DI, or owns setup → `use(data)` → teardown around each test              | **Fixture** (see the `fixtures` skill)                                                       |
| Encapsulates locators and user interactions on a specific page                                   | **Page object** (see the `page-objects` skill)                                              |
| Reusable happy-path data generation                                                              | **Factory** under `test-data/factories/{area}/` (see the `data-strategy` skill)             |

If the need fits none of these rows, stop and ask. Do not invent a new location.

### Phase 2: Pick the home — app-specific or utility

- **`helpers/{area}/`** — logic that only makes sense for the app under test: data seeding, app-specific request composition.
- **`helpers/util/`** — logic that's reusable across apps or projects: date formatting, string manipulation, retry logic, parsing utilities.

Prefer **extending an existing file** over creating a new one when the function belongs to the same domain. Create a new file only when the domain is genuinely new — and since `helpers/` doesn't exist yet, the first helper in an area creates both the directory and the file.

### Phase 3: Define the function signature, types, and JSDoc

Every exported helper must declare:

- An **explicit return type** (`Promise<void>`, `string`, `NewUser`, etc.). No implicit `any`.
- **Named parameters** with explicit types.
- A **JSDoc** block with a description, `@param` for every argument, `@returns`, and — when useful — an `@example` block.

Pattern:

```typescript
/**
 * Parses a currency string like "$1,234.56" into a number.
 * @param {string} value - The raw currency text.
 * @returns {number} The parsed numeric value.
 */
export function parseCurrency(value: string): number {
    // implementation
}
```

### Phase 4: Read env-driven values from `process.env.*`

Helpers **never** hardcode URLs, credentials, or tokens. Read from `process.env.*` and use enums for routes:

```typescript
import { Routes } from '../../enums/app/app';

// CORRECT
await page.goto(process.env.APP_URL + Routes.LOGIN);
await page.getByLabel('Email').fill(process.env.APP_EMAIL!);
await page.getByLabel('Password').fill(process.env.APP_PASSWORD!);

// FORBIDDEN
await page.goto('https://app.example.com/login');
```

See the `config` skill for sources of truth and the `enums` skill for routes.

### Phase 5: Consume the helper

Call the helper from the right context — helpers have no lifecycle of their own, so **where** you call them matters:

- **Inside a test / `beforeEach` / `afterEach`** — utility and seeding helpers freely.
- **Inside a fixture** — a fixture can call a helper as part of its setup/teardown. The fixture owns the lifecycle; the helper stays stateless.

Helpers should return their results through the function signature rather than mutating `process.env`.

## Examples

### Example 1: Add a utility helper

User says: _"Add a helper that parses a currency string like `$1,234.56` into a number so tests can assert on cart totals."_

Actions:

1. **Phase 1** — Pure function, no lifecycle → helper.
2. **Phase 2** — Generic, reusable across apps → `helpers/util/util.ts` (create it — no `helpers/` directory exists yet).
3. **Phase 3** — Signature: `export function parseCurrency(value: string): number`, with JSDoc + `@param` + `@returns`.
4. **Phase 5** — Consume inside tests: `expect(parseCurrency(await cart.totalText())).toBe(1234.56);`.

### Example 2: Add an app-specific seeding helper

User says: _"Wrap the create-product form flow so setup scripts can seed a product before a test."_

Actions:

1. **Phase 1** — Plain function, does not own per-test lifecycle → helper. If it needed guaranteed per-test teardown, it would be a fixture instead.
2. **Phase 2** — App-specific → `helpers/{area}/` (e.g. `helpers/app/seedProduct.ts`).
3. **Phase 3** — Signature: `export async function seedProduct(page: Page, overrides?: Partial<Product>): Promise<Product>`.
4. **Phase 4** — Read the app URL from `process.env.*`, the create-product route from `Routes.CREATE_PRODUCT`.
5. **Phase 5** — Call from the test's `beforeEach`, or from inside a fixture's setup block if 3+ spec files need it.

### Example 3: Counterexample — this is a fixture, not a helper

User says: _"I want to write a helper that creates a test record before each test and deletes it after."_

Actions:

1. **Phase 1** — "Creates before, deletes after" = Playwright lifecycle → **fixture**, not a helper.
2. Stop. Route to the `fixtures` skill and promote only if the setup/teardown is reused across **3+** spec files.
3. If it's used in only 1–2 files, keep it inline in `beforeEach` / `afterEach`.

## Troubleshooting

**My helper returns `undefined` for `process.env.*` values.**
Cause: Missing env variable in the active `env/.env.${ENVIRONMENT}` file.
Fix: Confirm the key exists there; update `env/.env.example` if you added a new variable. See the `config` skill.

**I want the helper to set up a resource and tear it down around each test.**
Fix: That's a fixture, not a helper. Route to the `fixtures` skill.

**A test behaves as if logged out partway through.**
Cause: `resetStorageState()` runs in `beforeEach` and clears cookies/permissions — if a later step in the same test needs to still be authenticated, it must call `loginPage.login(...)` again; there's no persisted session to fall back on.
Fix: Re-check the test's own login call, not a setup file — this framework has no `auth.setup.ts` to investigate.

**I want to mutate `process.env` inside a new helper for convenience.**
Fix: Don't. Pass values through return types or factory overrides instead — env mutation hides state and breaks parallel isolation.

**I'm about to promote a one-off helper to a helper fixture because "it feels reusable".**
Fix: Promote only when the same setup/teardown is copy-pasted across **3+** spec files with a lifecycle need. Otherwise keep it as a plain helper called inline.

**TypeScript complains that my helper has an implicit `any` return type.**
Fix: Add an explicit return type (`Promise<void>`, `Promise<NewUser>`, `string`, etc.) — Critical rule.

## See Also

- **`fixtures`** skill — Playwright fixtures with `use()` lifecycle (setup / yield / teardown); the sibling category to helpers, and the rule of thumb for promoting to a helper fixture. Owns `resetStorageState`, the actual mechanism this framework uses for auth resets.
- **`config`** skill — env variable conventions (`process.env.*`), where `APP_URL` / `APP_EMAIL` / `APP_PASSWORD` live.
- **`enums`** skill — `Routes.*` for routes.
- **`data-strategy`** skill — Faker factories used inside seeding helpers; three-tier rule for static invalid data.
- **`debugging`** skill — helper-driven test failures.
