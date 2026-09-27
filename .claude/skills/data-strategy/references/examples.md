# Data Strategy — Worked Examples

Three end-to-end walkthroughs aligned with the in-skill phases.

## Example 1: Add a factory for a new entity

User says: _"Add a factory for new products and use it in the happy-path create-listing test."_

Actions:

1. **Phase 1** — Happy-path dynamic data → Factory.
2. **Phase 2** — Create `test-data/factories/{area}/product.factory.ts` with `generateProduct(overrides?)` using Faker, returning an explicit `Product` type.
3. **Phase 4** — Import `generateProduct` in the spec; use the returned object to fill out the create-listing form.
4. Apply Critical rules: no hardcoded names, JSDoc on the factory, explicit return type — no `any`.

## Example 2: Add a domain-specific invalid-values set

User says: _"Add invalid promo codes so we can check the promo-code field rejects them."_

Actions:

1. **Phase 1** — Curated invalid set specific to promo-code validation → Tier 2.
2. **Phase 3** — Create `test-data/static/{area}/invalidPromoCodes.ts` with either Shape A (`export const INVALID_PROMO_CODES = ['EXPIRED', 'TOOLONG...', ...] as const;`) or Shape B (`export const INVALID_PROMO_CODE_CASES = [{ description: '...', value: '...' }, ...] as const;`) depending on how the test consumes them.
3. **Phase 4** — Import the `as const` export and loop with `for...of` to generate one test per entry.
4. Do not combine these with universal type mismatches — keep Tier 1 (`INVALID_STRING_VALUES`) and Tier 2 in **separate** `for...of` loops.

## Example 3: Full negative-coverage form validation combining factory + universal + boundary

User says: _"Lock down validation for the create-product form."_

Actions:

1. **Phase 1** — Multiple value kinds: happy-path base (factory), type-mismatch (Tier 1), out-of-range rating (Tier 3 inline).
2. **Phase 2** — Confirm `generateProduct()` exists; create it if not.
3. **Phase 4** — In the spec:
    - Use `generateProduct()` as the valid base values, filling every other field.
    - Loop `INVALID_STRING_VALUES` for the `name` field, `INVALID_NUMBER_VALUES` for the `price` field, etc., submitting the form and asserting the matching validation message per iteration.
    - Add a final inline loop `const outOfRangeRatings = [...]` for the `1..5` rating constraint.
4. Keep Tier 1, Tier 2, and Tier 3 loops separate — don't merge type-mismatch and boundary values into one array.

## Phase 4 consumption snippets (Tier 2 + Tier 3)

### Tier 2 — Domain-specific static data (Shape B)

```typescript
import { INVALID_LOGIN_ATTEMPTS } from '../../../test-data/static/app/invalidCredentials';

for (const { description, email, password } of INVALID_LOGIN_ATTEMPTS) {
    test(
        `should show error for ${description}`,
        { tag: '@regression' },
        async ({ appPage }) => {
            await appPage.login(email, password);
            await expect(appPage.errorMessage).toBeVisible();
        }
    );
}
```

### Tier 3 — Field-specific boundary (inline in the spec)

```typescript
const outOfRangeRatings = [-1, 0, 0.99, 5.01, 6, 1000];

for (const invalidValue of outOfRangeRatings) {
    test(
        `should show a validation error when rating is out of range (${invalidValue})`,
        { tag: '@regression' },
        async ({ appPage }) => {
            // ...
        }
    );
}
```
