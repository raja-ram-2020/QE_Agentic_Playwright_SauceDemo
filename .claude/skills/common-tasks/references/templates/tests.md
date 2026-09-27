# Test Templates

Prompt templates for functional, E2E, and data-driven tests. The `test-standards` and `data-strategy` skills own the deep rules. Resolve `{area}` with `ls tests/` first.

> **Important:** Before generating tests, navigate through the user flow to understand the actual steps and expected outcomes.

## Create a Functional Test

Functional tests verify one feature or behaviour in isolation. Each test covers a single thing.

```
Create a functional test for [FEATURE]:
- Location: tests/{area}/functional/[name].spec.ts  (run `ls tests/` first)
- Import from fixtures/pom/test-options.ts
- Use factory data from test-data/factories/{area}/ — never hardcode test content
- Tag with exactly ONE tag: @smoke | @sanity | @regression — or @destructive if the test modifies shared state (destructive overrides and is the only tag)
- Structure with test.describe and test.step (Given/When/Then)
- Use beforeEach for navigation/setup

Test scenarios:
1. [Scenario 1]
2. [Scenario 2]
```

## Create an E2E Test

E2E tests chain multiple features together in a single test that mirrors a complete real user journey.

```
Create an E2E test for [USER JOURNEY].

First, run `ls tests/` to find the correct area subdirectory.

Then navigate through the full flow at [STARTING_URL] to discover:
- The complete sequence of steps from start to finish
- Elements and state at each milestone
- Final expected state

Then generate the test with:
- Location: tests/{area}/e2e/[name].spec.ts  (use real area name from ls)
- A SINGLE test covering the entire journey (not one test per step)
- Factory data from test-data/factories/{area}/
- Tag: @e2e
- Steps that chain naturally: setup → action → action → ... → final assertion
```

## Add Data-Driven Tests

```
Add data-driven tests to [TEST FILE] for [SCENARIO]:
- Use static data from test-data/static/{area}/[file].ts  (run `ls test-data/static/` first)
- Import the named `as const` export; never redeclare inline
- Loop outside test blocks to generate individual tests
- Each test should have descriptive name including test data

Test data structure (test-data/static/{area}/[file].ts):

export const CASES = [
    { description: '', input: '', expected: '' },
] as const;
```
