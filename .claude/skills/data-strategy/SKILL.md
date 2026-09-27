---
name: data-strategy
description: Test data strategy for the Playwright scaffold — Faker factories for dynamic happy-path data, static TS files (`.ts` with `as const` exports — never `.json`) for domain-specific curated invalid sets, and the universal type-mismatch arrays in test-data/static/util/invalid-values.ts. Use when creating or editing a data factory, adding a new invalid-values dataset, deciding between factory / static / inline / enum for a new test value, writing data-driven tests, or updating existing static data. For safe edits to existing static values see the refactor-values skill; for TypeScript typing rules see the type-safety skill.
---

# Data Strategy

This framework uses a **bifurcated data strategy**: static data for deterministic curated cases and dynamic factories for test isolation.

## Critical

- **Static data files are TypeScript only.** Every file under `test-data/static/**` is a `.ts` file that exports `as const` literal values. **NEVER** use `.json`.
- **Static data files may only export literal values.** No runtime imports (type-only imports are fine), no function definitions, no computed values, no Faker calls. Dynamic data belongs in factories, not in static files.
- **NEVER** hardcode test content strings (names, emails, todo text, product names, descriptions, etc.) in a spec file. Generate with a Faker factory.
- **NEVER** redefine universal type-mismatch arrays (`[123, true, null, undefined]`, etc.) inline. Import them from `test-data/static/util/invalid-values.ts`.
- **NEVER** generate app-defined strings with Faker (error messages, button labels, page headers). Those live in `enums/` so they stay in sync with the application under test.
- **NEVER** store fixed expected values that are used in a single assertion in a static data file. Keep them inline in the test.
- **ALWAYS** follow the `refactor-values` skill before editing any existing static-data file or enum value — these edits cascade through assertions and data-driven loops.
- **NEVER** introduce magic numbers (timeouts, retry counts, limits) inline. Prefer web-first assertions; when a numeric value is unavoidable, route it through `playwright.config.ts` or an enum in `enums/`.

## File Locations

> **`{area}` is a placeholder.** Before creating or referencing any path below, run `ls test-data/static/` and `ls test-data/factories/` to discover the real subdirectory names in this repo (e.g., `front-office`, `back-office`) and use those instead.

| Type                     | Directory                     | Purpose                                                                              |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| Universal invalid arrays | `test-data/static/util/`      | Type-mismatch tuples reused by every negative test (`.ts`, `as const`)               |
| Domain-specific static   | `test-data/static/{area}/`    | Curated invalid/boundary sets tied to the app's validation rules (`.ts`, `as const`) |
| Dynamic factories        | `test-data/factories/{area}/` | Faker factories for unique, valid data per test run                                  |

## Instructions

### Phase 1: Classify the value you need

Use this decision table before touching any file. Each row points to the canonical home.

| Value kind                                                                                                   | Home                                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Happy-path dynamic data (emails, names, IDs, todo text, product names)                                       | Factory in `test-data/factories/{area}/*.factory.ts`                     |
| Universal type-mismatch values for any `string`/`number`/etc. field                                          | Import from `test-data/static/util/invalid-values.ts` (already exists)   |
| Domain-specific curated invalid sets (invalid emails, weak passwords, forbidden categories, invalid locales) | `.ts` with `as const` exports under `test-data/static/{area}/`           |
| Field-specific boundary / range values (e.g., out-of-range for a `1..5` number)                              | **Inline** in the spec file when used in exactly one place               |
| App-defined strings (error messages, button labels, page titles)                                             | `enums/{area}/*` (see the `enums` skill) — **not** Faker, **not** static |
| Fixed expected values used in a single assertion                                                             | **Inline** in the test — not a JSON file                                 |
| Timeouts, retries, workers, test-suite tuning                                                                | `playwright.config.ts` (see the `config` skill) — not `test-data/`       |

If the value fits none of the rows, stop and ask. Do not invent a new location.

### Phase 2: Create or extend a factory

Follow this when Phase 1 pointed at a factory. Factories use **Faker** for unique, valid data per test run — this prevents collisions in parallel execution.

```typescript
import { faker } from '@faker-js/faker';

export type NewUser = {
    email: string;
    password: string;
    fullName: string;
};

/**
 * Generates a valid new-user object with randomized data.
 * @param {Partial<NewUser>} overrides - Optional overrides for specific fields.
 * @returns {NewUser} A valid new-user object for filling out signup/checkout forms.
 */
export const generateNewUser = (overrides?: Partial<NewUser>): NewUser => {
    const defaults: NewUser = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        fullName: faker.person.fullName(),
    };

    return { ...defaults, ...overrides };
};
```

Key requirements:

1. **Import Faker:** `import { faker } from '@faker-js/faker';`
2. **Accept overrides:** `overrides?: Partial<ReturnType>` for customisation.
3. **Export an explicit type:** define and export the shape the factory returns; no `any`.
4. **JSDoc:** factories are action-like functions — include `@param` / `@returns`.

### Phase 3: Add static data

Follow this when Phase 1 pointed at static data. Pick the right tier first.

#### Tier 1 — Universal type-mismatch arrays (already centralised)

Do **not** create a new file. The universal arrays already live at `test-data/static/util/invalid-values.ts`:

```
INVALID_STRING_VALUES   → [123, true, null, undefined]
INVALID_NUMBER_VALUES   → ['string', '123', true, null, undefined]
INVALID_BOOLEAN_VALUES  → ['yes', 1, 0, null, undefined]
INVALID_UUID_VALUES     → ['not-a-uuid', '', 123, null, undefined]
INVALID_ENUM_VALUES     → ['invalidValue', '', 123, null, undefined]
INVALID_ARRAY_VALUES    → ['string', 123, null, undefined, {}]
INVALID_OBJECT_VALUES   → ['string', 123, null, undefined, []]
```

Import and iterate in spec files; never redefine.

#### Tier 2 — Domain-specific static data (`test-data/static/{area}/`)

Create a new `.ts` file here when you have a **curated** set of invalid or boundary values that are specific to the application's validation rules (invalid email formats, weak-password policy violations, forbidden enum values, locale strings, etc.).

Two canonical shapes — pick whichever fits the call site:

**Shape A — per-field invalid-value arrays** (the shape used by the scaffold's existing `test-data/static/app/invalidCredentials.ts`):

```typescript
export const INVALID_EMAILS = [
    '',
    'plaintext',
    'missing-at-sign.com',
    'missing@domain',
    '@missing-local.com',
    'double@@at.com',
] as const;

export const INVALID_PASSWORDS = ['', '123', 'short', 'NoNumber!'] as const;
```

Use Shape A when each invalid value targets **one** field at a time (classic per-field negative loop).

**Shape B — test-case objects with descriptions** for parametrised tests that combine multiple fields:

```typescript
export const INVALID_LOGIN_ATTEMPTS = [
    {
        description: 'valid email with wrong password',
        email: 'test.user@example.com',
        password: 'WrongPassword123!',
    },
    {
        description: 'unknown email with any password',
        email: 'nobody@example.com',
        password: 'AnyPassword123!',
    },
] as const;
```

Use Shape B when each row represents a **scenario** with multiple fields that must be tested together.

Always `.ts` with `as const`. Never `.json`. `.ts` gives type safety, `undefined`/`NaN` support, narrow literal autocomplete, JSDoc comments explaining rationale, and compiler-assisted refactors — all lost with JSON.

#### Tier 3 — Field-specific boundary values

These stay **inline** in the spec file. Do not create a static file for a single out-of-range set.

```typescript
const outOfRangeRatings = [-1, 0, 0.99, 5.01, 6, 1000];
```

Promote to Tier 2 only if the same boundary set is reused across 2+ fields or spec files.

### Phase 4: Consume the data in tests

**Factory (happy path or setup):**

```typescript
import {
    generateNewUser,
    generateLoginCredentials,
} from '../../../test-data/factories/app/user.factory';

const newUser = generateNewUser();
const creds = generateLoginCredentials();

const adminUser = generateNewUser({ email: 'admin@company.com' });
const customCreds = generateLoginCredentials({
    password: 'SpecificPassword123!',
});
```

**Universal invalid arrays (Tier 1):**

```typescript
import { INVALID_STRING_VALUES } from '../../../test-data/static/util/invalid-values';

for (const invalidValue of INVALID_STRING_VALUES) {
    test(
        `should show a validation error when name is ${JSON.stringify(invalidValue)}`,
        { tag: '@regression' },
        async ({ appPage }) => {
            // ...
        }
    );
}
```

**Domain-specific static data (Tier 2)** and **field-specific boundary (Tier 3)** — full snippets in `references/examples.md`. Same `for...of` pattern as Tier 1 above; Tier 2 imports a named `as const` export from `test-data/static/{area}/`, Tier 3 declares the array inline.

### Phase 5: Editing existing static data

When you need to update a value in `test-data/static/`, the change can break existing test assertions and expectations that rely on the old value. **Always search for all consumers before editing.**

**Read the `refactor-values` skill** (`.claude/skills/refactor-values/SKILL.md`) before modifying any existing static-data file or enum value. It owns the impact-analysis + cascading-update workflow.

## No Magic Numbers

Do not hardcode timeouts, retry counts, or other tuning numbers inline. The preferred path is web-first assertions — Playwright waits for the condition automatically:

```typescript
// FORBIDDEN -- hard wait masks real timing issues
await page.waitForTimeout(5000);

// CORRECT -- web-first assertion, no magic number needed
await expect(appPage.successMessage).toBeVisible();
```

When a numeric tuning value is genuinely unavoidable:

- **Test-suite tuning** (default action timeout, expect timeout, retries, workers) → `playwright.config.ts` (see the `config` skill).
- **Domain-level limits** (max retries for a custom helper, page-size constants) → an enum in `enums/{area}/*` (see the `enums` skill).
- **Per-assertion override** (one assertion that legitimately needs more time) → pass inline on the assertion: `await expect(locator).toBeVisible({ timeout: 10000 })`. Justify why in a short comment.

## See Also

- **`refactor-values`** skill — impact analysis and cascading update workflow for enum values and static data changes.
- **`type-safety`** skill — TypeScript typing rules (no `any`, explicit return types) applied to factory functions.
- **`enums`** skill — canonical home for app-defined strings (error messages, labels, route paths).
- **`config`** skill — where timeouts / retries / workers belong (`playwright.config.ts`), not `test-data/`.
- **`debugging`** skill — when a data-driven loop fails one row out of many, classify and investigate before mutating the factory.
- **`references/examples.md`** — three worked walkthroughs (new factory, domain-specific invalid set, full negative-API coverage combining factory + universal + boundary) plus Tier 2 + Tier 3 consumption snippets.
- **`references/troubleshooting.md`** — common data-strategy pitfalls (parallel collisions, factory schema parse failure, inline invalid arrays, Faker-generated app strings, single-string JSON, edits to existing static data, magic-number timeouts).
