# Common-Tasks Worked Examples

Three end-to-end walkthroughs showing how to combine a `common-tasks` template with the 8-phase `ai-native-workflow` and the relevant specialized skills. Phase numbering aligns with `ai-native-workflow/SKILL.md`.

## Example 1: Add a new page object and a functional test

User says: _"Add a page object and a functional smoke test for the settings page at /settings."_

1. **Phase 1 — Classify** — Codegen, two artifacts (page object + functional test).
2. **Phase 2 — Route** — `common-tasks` (template) → `page-objects` + `test-standards` (deep rules).
3. **Phase 3 — Explore** — Run `ls pages/` and `ls tests/` to resolve `{area}`. Run `playwright-cli goto /settings` then `snapshot` to discover roles, labels, forms, buttons. (`playwright-cli` is the only sanctioned UI explorer — see `CLAUDE.md` "No Substitute UI Exploration".)
4. **Phase 4 — Plan + Confidence** — Copy **Add a New Page Object (With Exploration)** + **Create a Functional Test** templates; fill `[PAGE NAME]`, `[URL]`, `[FEATURE]`, scenarios. Output Confidence + Unknowns.
5. **Phase 5 — Human gate** — Confirm.
6. **Phase 6 — Apply** — `getByRole` first, no JSDoc on getters, single `@smoke` tag, factory data only. Register page object in `fixtures/pom/page-object-fixture.ts`.
7. **Phase 7 — Verify** — Walk the verification checklist; run `npx playwright test tests/{area}/functional/settings.spec.ts`.
8. **Phase 8 — Report + commit** — _"Add SettingsPage page object and @smoke functional test"_.

## Example 2: Add a data-driven negative test using static data

User says: _"Add negative tests for the login form covering every invalid-credential combination we have."_

1. **Phase 1 — Classify** — Codegen, one artifact (data-driven functional test) plus a possible static-data addition.
2. **Phase 2 — Route** — `common-tasks` (templates) → `test-standards` + `data-strategy` (deep rules).
3. **Phase 3 — Explore** — `ls tests/`, `ls test-data/static/`. Confirm `INVALID_LOGIN_ATTEMPTS` (or equivalent) already exists in `test-data/static/{area}/`; if not, draft it per the `data-strategy` three-tier rule.
4. **Phase 4 — Plan + Confidence** — Copy the **Add Data-Driven Tests** template; fill in the static-data file and scenario list. Output Confidence + Unknowns.
5. **Phase 5 — Human gate** — Confirm.
6. **Phase 6 — Apply** — Loop `for...of` outside the `test()` block, one test per row, `@regression` tag, assert against `Messages.*` enum values (never hardcoded strings).
7. **Phase 7 — Verify** — Walk the verification checklist; run `npx playwright test tests/{area}/functional/login.spec.ts`.
8. **Phase 8 — Report + commit** — _"Add data-driven negative login tests from static invalid-credential set"_.

## Example 3: Add a destructive test (shared/global state)

User says: _"Add a test that switches the application's default locale to `fr-FR` and verifies the UI translates."_

This mutates **shared/global** state — the locale is read by every other test/session, so it is genuinely `@destructive`. (Contrast: a test that merely **creates and deletes its own user** touches no shared state — that one is `@regression`, not `@destructive`, even though it also needs cleanup.)

1. **Phase 1 — Classify** — Codegen (functional test; factory only if dynamic content values are needed).
2. **Phase 2 — Route** — `common-tasks` (templates) → `test-standards` (Phase 7 destructive rules); `fixtures` / `helpers` only if the locale setup/reset will be reused across 3+ files.
3. **Phase 3 — Explore** — `ls tests/`, confirm the locale enum/setting and the reset path (the admin UI control that restores the default locale).
4. **Phase 4 — Plan + Confidence** — Copy the **Create a Functional Test** template. Output Confidence + Unknowns.
5. **Phase 5 — Human gate** — Confirm.
6. **Phase 6 — Apply** — Single `@destructive` tag (overrides any other importance tag — `@destructive` is heaviest and wins), no hardcoded strings. Wire `afterEach` / `afterAll` cleanup that **restores the default locale** even on failure.
7. **Phase 7 — Verify** — Checklist emphasis: `@destructive` is the only tag, locale-reset teardown in place, no hardcoded credentials. Run the file; confirm the run leaves the default locale restored.
8. **Phase 8 — Report + commit** — _"Add @destructive test for locale switch with reset"_.
