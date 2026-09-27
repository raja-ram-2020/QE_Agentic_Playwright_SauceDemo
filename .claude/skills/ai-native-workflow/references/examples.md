# Examples — Multi-Skill Chains

Three end-to-end walkthroughs showing how the 8-phase workflow chains across specialized skills.

## Example 1: "Add a page object and test for a new page"

User: _"Add a page object and a smoke test for the new /wishlist page."_

1. **Phase 1 — Classify** — Codegen, two artifacts (page object + functional test).
2. **Phase 2 — Route** — `common-tasks` (template) → `page-objects` + `test-standards` (deep rules).
3. **Phase 3 — Explore** — `ls pages/`, `ls tests/` to resolve `{area}`. Run `playwright-cli goto /wishlist` then `snapshot` to discover roles, labels, buttons — the only sanctioned UI explorer (see `CLAUDE.md` "No Substitute UI Exploration").
4. **Phase 4 — Plan + Confidence** — Page object structure (locators, feedback messages), fixture registration, test scenarios. Output confidence + unknowns.
5. **Phase 5 — Human gate** — Confirm scope.
6. **Phase 6 — Apply** — `getByRole` first (`selectors`), no JSDoc on getters, `Routes.WISHLIST` enum (`enums`), single `@smoke` tag (`test-standards`), register in `fixtures/pom/page-object-fixture.ts` (`fixtures`).
7. **Phase 7 — Verify** — Run `npx playwright test tests/{area}/functional/wishlist.spec.ts` against the `common-tasks` verification checklist. On red, load `debugging`.
8. **Phase 8 — Report + commit** — _"Add WishlistPage page object and @smoke functional test"_.

## Example 2: "Rename an enum value safely"

User: _"The app renamed `/inventory.html` to `/catalog.html`. Update us."_

1. **Phase 1 — Classify** — Refactor.
2. **Phase 2 — Route** — `refactor-values` direct.
3. **Phase 3 — Explore** — `rg "Routes.INVENTORY" .` and `rg "'/inventory.html'" .` to find every consumer.
4. **Phase 4 — Plan + Confidence** — `enums/{area}/app.ts` change + impacted spec files + helpers + sibling skill docs that mention the old path. Confidence + unknowns.
5. **Phase 5 — Human gate** — Confirm.
6. **Phase 6 — Apply** — Follow `refactor-values` end-to-end (impact tables, atomic edit, no stale references left behind).
7. **Phase 7 — Verify** — `npx tsc --noEmit` + `npx eslint .` + `npx playwright test --grep "inventory"`. On red, classify the failure and fix at the root cause (`debugging`).
8. **Phase 8 — Report + commit** — _"Rename Routes.INVENTORY to /catalog.html per app change"_.

## Example 3: "CI failure that doesn't reproduce locally"

User: _"tests/app/functional/checkout.spec.ts is red in CI but green locally. Fix it."_

1. **Phase 1 — Classify** — Debug.
2. **Phase 2 — Route** — `debugging` direct.
3. **Phase 3 — Explore** — Download the CI `playwright-report` / `test-results` artifacts (`debugging` Phase 7); open the failed trace.
4. **Phase 4 — Plan + Confidence** — State the diagnosis (e.g. CI's storage state was stale, or a viewport/env difference) and the proposed fix. Confidence + unknowns — if the cause is still unclear, confidence stays low and the agent asks rather than guessing.
5. **Phase 5 — Human gate** — Confirm the diagnosis and fix approach.
6. **Phase 6 — Apply** — Fix at the root cause per `debugging` Phase 5's table (e.g. add a readiness probe before the suite runs) — never raise a timeout or add a hard wait to mask it.
7. **Phase 7 — Verify** — Re-run locally under the same conditions (`ENVIRONMENT=ci CI=1 npx playwright test ...`), then push and confirm the CI run is green.
8. **Phase 8 — Report + commit** — _"Fix CI-only checkout test failure caused by stale storage state"_.
