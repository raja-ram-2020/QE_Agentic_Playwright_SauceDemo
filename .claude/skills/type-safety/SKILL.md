---
name: type-safety
description: TypeScript type safety conventions for the Playwright framework — the "no any" rule, banning unsafe `as T` casts, explicit return types on exported functions, and the two sanctioned patterns for process.env.* (non-null assertion ! vs ?? fallback). Use when writing type annotations on function signatures, reviewing code for any / unsafe casts, or deciding between ! and ?? on a process.env.* access. For env-variable definitions (where APP_URL etc. are declared) see the config skill.
---

# Type Safety

## Critical

- **NEVER** use `any`. Use explicit types or `unknown` at boundaries.
- **NEVER** use `as T` or `as unknown as T` to silence the type-checker. If you genuinely need to cross a type boundary (e.g. an untyped third-party response), narrow with a type guard or validate the shape explicitly instead of casting blind.
- **ALWAYS** specify explicit return types on exported and public functions (`Promise<void>`, `Promise<NewUser>`, `Locator`, `string`, etc.).
- **Access `process.env.*` with `!` (guaranteed at runtime) or `??` (with a safe fallback).** Never let `string | undefined` leak into downstream code.

## Instructions

### Phase 1: Rule out `any` and unsafe casts

The TypeScript project is `"strict": true`. That configuration exists to surface bad types; don't work around it.

```typescript
// FORBIDDEN
const data: any = await response.json();
function process(input: any): any {
    /* ... */
}
const user = raw as NewUser;
const user = raw as unknown as NewUser;

// CORRECT
const raw: unknown = await response.json();
function process(input: unknown): ProcessedResult {
    /* ... */
}
```

Rules:

- `unknown` is the right type at a **boundary** (network, file read, user input) — narrow it explicitly before use, never cast past it.
- Inside a function body, every variable must have a concrete type (explicit or inferred from a typed source).
- `as T` is a red flag. If you see one, ask whether the value can instead be produced by a function whose return type already matches, or narrowed with a proper type guard.

### Phase 2: Annotate function signatures

Always specify return types on public / exported functions. TypeScript can often infer them, but an explicit annotation documents the contract and surfaces breaking changes earlier.

```typescript
// CORRECT
async submit(): Promise<void> { /* ... */ }
async getData(): Promise<NewUser> { /* ... */ }
get submitButton(): Locator { /* ... */ }
export function formatDate(value: number | string): string { /* ... */ }

// AVOID -- return type missing
async submit() { /* ... */ }
```

Parameter types must also be explicit — never rely on `noImplicitAny` to rescue a missing annotation.

### Phase 3: Handle `process.env.*` correctly

`process.env.X` is always typed as `string | undefined`. Two sanctioned patterns:

```typescript
// Pattern A -- non-null assertion: use when the value is guaranteed at runtime
// (e.g., because the key is required in env/.env.example).
const url = process.env.APP_URL!;

// Pattern B -- fallback: use when a sensible default exists or the value is
// truly optional.
const environment = process.env.ENVIRONMENT ?? 'dev';
const timeout = Number(process.env.TIMEOUT_MS ?? 10000);
```

Never let `string | undefined` spread into downstream code unchecked:

```typescript
// FORBIDDEN -- downstream consumers will get `string | undefined`
export const baseUrl = process.env.APP_URL;

// CORRECT -- force the resolution at the access point
export const baseUrl = process.env.APP_URL!;
// or
export const baseUrl = process.env.APP_URL ?? 'http://localhost:3000';
```

**NEVER** hardcode secrets, passwords, or URLs. See the `config` skill for where env variables are declared.

```typescript
// FORBIDDEN
const password = 'secret123';

// CORRECT
const password = process.env.APP_PASSWORD!;
```

## TypeScript Strict Mode

The project uses `"strict": true` in `tsconfig.json`. Consequences:

- All parameters must have explicit types.
- Return types should be specified on public methods.
- No implicit `any`.
- Null checks are enforced (`strictNullChecks`).

Do not disable or weaken strict mode for a single file. If a type feels impossible to express, the shape is usually wrong — model it explicitly rather than casting around it.

## See Also

- **`config`** skill — where env variables are declared (`env/.env.example`, dotenv loading) and the consumption decision for `!` vs `??`.
- **`data-strategy`** skill — Faker factories that return explicitly-typed objects.
- **`helpers`** skill — explicit return types on exported helper functions.
- **`debugging`** skill — when an unexpected runtime shape produces a `TypeError` or `undefined` access.
