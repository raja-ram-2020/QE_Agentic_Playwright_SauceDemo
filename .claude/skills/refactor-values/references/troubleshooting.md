# Refactor-Values — Troubleshooting

## Test fails with `expected X to be visible` after updating a message

**Cause:** A test hardcoded the old raw string and bypassed the enum.
**Fix:** Search for the old string value in `tests/`, replace with `Messages.<NEW_KEY>` imported from `enums/{area}/*`.

## TypeScript complains `Property LOGIN_ERROR does not exist on type Messages`

**Cause:** Missed consumer after a key rename.
**Fix:** Run `npx tsc --noEmit` and fix every location it reports. Then search `.md` files for the old key name in documentation.

## `npx playwright test --grep 'login'` didn't run my test

**Cause:** `--grep` matches **tag names** and **test titles**. If your test is tagged `@regression` and doesn't have "login" in its title, it won't match.
**Fix:** Run the spec file directly (`npx playwright test tests/app/functional/login.spec.ts`), or grep by tag (`--grep @regression`).

## My global find-and-replace missed matches in README / skill files / rules

**Cause:** Find-and-replace scoped to source files misses documentation.
**Fix:** Re-grep without file-type filters (`rg "OLD_VALUE"` plain), inspect each hit individually, and update `README.md`, `CHANGELOG.md`, and any `.claude/skills/*` doc that references the renamed/updated value.
