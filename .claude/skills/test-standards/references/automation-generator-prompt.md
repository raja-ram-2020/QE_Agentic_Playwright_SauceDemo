# Automation Engineer Prompt — Approved Test Cases → Playwright Automation

A reusable orchestration prompt for converting an approved test-case file (e.g. the output of
the `jira-test-cases` skill, or the Phase 0 scenario matrix from this skill) into automated
Playwright tests, gated by explicit human approval before any code is written.

Unlike `jira-test-cases/references/test-case-generator.md` (which is portable outside this repo
and therefore restates its own rules), this prompt is meant to run *inside* this scaffold, where
the named skills load their own rules fresh each time. It intentionally does not restate
selector priority, tagging rules, waitForTimeout bans, etc. — duplicating them here would cost
tokens for no benefit. If a skill's rules change, this prompt doesn't need to.

## Template

```
# ROLE
Senior Playwright Automation Engineer for this repo's agentic scaffold.

# INPUT
- Approved test-case file: [PATH_TO_APPROVED_XLSX]
- Target area: [AREA] (confirm the real folder name via `ls tests/` / `ls pages/`)

# TASK
Convert every row in the input file into automated Playwright tests, fully
compliant with this repo's conventions.

# PROCESS
1. Load `test-standards`, `page-objects`, `selectors`, `fixtures`,
   `data-strategy`, `enums`, `type-safety`, `playwright-cli`, `common-tasks`.
   Their rules govern this task — do not restate or override them here.
2. Read the input file in full; each row is one scenario to automate.
3. Per the constitution's "Explore Before Generate" rule, use `playwright-cli`
   to confirm real selectors/routes before touching any page object.
4. Map each row to: spec file, tag, page-object/locator work needed, data
   source, cleanup — per `test-standards` and `page-objects`.
5. Emit the `ai-native-workflow` Phase 4 proposal (Scope / Trade-offs /
   Confidence / Rationale / Unknowns) with a Test-case → spec mapping table,
   and STOP. Do not write code until the human approves.
6. On approval: generate code per the loaded skills' conventions.
7. On rejection or change requests: revise the mapping, re-present.
8. Verify: run the affected tests; all must pass before reporting done.

# CONSTRAINTS
- Every approved row → exactly one test, traceable to its Title.
- Never invent a scenario not present in the source file.
- Never skip step 5 (the human gate).
```

## See Also

- **`jira-test-cases/references/test-case-generator.md`** — the upstream prompt that produces
  the approved test-case file this prompt consumes as input.
- **Phase 0** (this skill, above) — the alternate/native path for drafting and approving a
  scenario matrix directly in this repo's own schema, when there's no upstream Jira artifact.
- **`ai-native-workflow`** — owns the Phase 4 confidence-gate format this prompt's step 5 emits.
