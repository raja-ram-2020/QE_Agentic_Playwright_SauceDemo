---
name: jira-test-cases
description: Converts a Jira ticket's requirements/acceptance criteria into a QA-reviewable Excel test-case matrix (Title / Preconditions / Steps / Expected Result / Test Data / Type). Use whenever the user gives a Jira ticket URL or key (e.g. "SCRUM-8", a "*.atlassian.net/browse/..." link) and asks for test cases, test scenarios, QA coverage, or "convert this ticket into tests" — even if they don't say the word "Excel". Requires the Atlassian/Jira MCP connector to be authenticated and live in the current session (see Phase 1); if it isn't, this skill says so rather than guessing at the ticket's content. Produces a human-review artifact that feeds the `test-standards` skill's Phase 0 approval gate, but with its own QA taxonomy (Positive/Negative/Edge/Boundary/Performance), not Playwright tags — don't conflate the two schemas.
---

# Jira → Test Cases

Turns a Jira ticket's acceptance criteria into a reviewable Excel test-case matrix. This is
research-then-transcribe work, not generative writing: every test case must trace back to
something the ticket actually says. The value of this skill is precision and traceability, not
volume — a QA reviewer needs to see their own requirement reflected back accurately enough to
sign off on it.

## Critical

- **Never fabricate acceptance criteria.** If the ticket has no description/AC and no usable
  attachment, stop and ask the human to paste the requirements. Do not invent test cases from
  the ticket title or summary alone — a title like "Login functionality" tells you the topic,
  not the behavior.
- **The Atlassian/Jira MCP connector must be live in *this* session.** `ToolSearch` for
  something like `"jira atlassian confluence issue"` should surface tools such as
  `mcp__claude_ai_Atlassian_MCP__getJiraIssue`. If nothing comes back, the connector either
  isn't configured or was authenticated in a *different* session — see Phase 1. Don't fall back
  to `WebFetch` on the ticket URL; it reliably fails on authenticated Jira instances (returns no
  real content, confirmed by direct test — it doesn't even error cleanly, it just returns
  near-empty chrome that looks superficially like a real response).
- **Requirements often live in an attachment, not the description field.** Some Jira setups
  (this org included) leave the issue description empty and attach a requirements/traceability
  spreadsheet instead. Always check attachments before concluding a ticket has no usable
  content — see Phase 2.
- **Output is always a `.xlsx`** built with the `xlsx` skill — never a markdown table, never
  inline chat text. The point is a shareable, reviewable artifact a QA lead can open directly.
- **Exact 6 columns, exact header names, exact order:** `Title | Preconditions | Steps |
  Expected Result | Test Data | Type`. Don't add, drop, or rename columns without the human
  asking — this schema was specified deliberately, not left open for improvisation.
- **One row per distinct scenario, not one row per requirement.** A requirement with three
  Given/When/Then branches (three different bad-input combinations, say) becomes three test
  cases, each carrying the exact literal values and exact expected message for that branch.
  Collapsing them into one row loses the traceability the matrix exists to provide.
- **Only emit the Types the AC actually implies.** A ticket with no stated limits or timing
  requirements should produce zero Boundary/Performance rows — that's an accurate reflection of
  the source, not missing coverage. Resist the pull to round out all five types for symmetry.
- **Save to `test-scenarios/{area}/{summary_snake_case}_testcases.xlsx`.** `{summary}` is the
  Jira issue's own `summary` field, snake_cased (lowercase, non-alphanumerics → `_`). `{area}`
  is resolved the same way as the rest of this scaffold — check `ls tests/` / `ls pages/`; if
  the app has no area folder yet (new app under test), ask the human what to call it rather
  than guessing, since it becomes the standing folder name for everything that follows.
- **This is upstream of, not the same as, `test-standards` Phase 0.** Phase 0's scenario matrix
  is automation-facing (Playwright tags like `@smoke`). This skill's output is QA-facing (the
  Positive/Negative/Edge/Boundary/Performance taxonomy). A human decides how an approved row
  here becomes a tagged Playwright test later — don't try to auto-map between the two schemas
  unless asked.

## Instructions

### Phase 1: Confirm the Jira connector is live

1. `ToolSearch` for `"jira atlassian confluence issue"` (or similar terms). Atlassian MCP tools
   (`getJiraIssue`, `searchJiraIssuesUsingJql`, `discover`, `executeRead`, …) should appear.
2. If nothing comes back, run `claude mcp list` via Bash.
   - If an Atlassian connector is listed but shows "Needs authentication", run
     `claude mcp login "<exact name from the list>"` and tell the human a browser window should
     open for them to complete the OAuth flow. **A freshly authenticated connector only attaches
     to a *new* session** — the current session won't see it live. Ask the human to start a new
     session (or, if there's a peer session already running elsewhere, message it — see below)
     rather than repeatedly re-checking `ToolSearch` in the same session.
   - If no Atlassian connector is configured at all, tell the human this needs to be added
     first and don't attempt to read the ticket any other way.
3. **Workaround when this session itself can't get the tools but a peer session can:** if
   another Claude Code session on the same machine already has the connector live (check
   `ListAgents`), send it a message via `SendMessage` asking it to run the specific read-only
   calls you need (issue fetch, attachment fetch) and paste back the *raw* results verbatim —
   not a summary. Do the actual reasoning and drafting yourself once the raw data comes back;
   don't delegate judgment calls to the peer, only the tool calls it alone can make.

### Phase 2: Fetch the ticket's requirements

1. Call `getJiraIssue` with `cloudId` (a plain site URL works, e.g. `https://<site>.atlassian.net`
   — no separate "accessible resources" lookup needed), `issueIdOrKey` (accepts a full ticket
   URL directly, not just a bare key), `view: "full"`, `responseContentFormat: "markdown"`.
2. If `fields.description` (or a custom Acceptance Criteria field) has real content, that's your
   source — proceed to Phase 3.
3. If it's empty or missing, check `fields.attachment` for anything that looks like a
   requirements source (spreadsheet, doc, PDF). Tell the human explicitly which attachment you
   used, so they can verify you read the right thing.
   - The attachment-download tool is not always in the primary tool list surfaced by
     `ToolSearch` — search via `discover` and/or try `executeRead` for something like
     `downloadJiraIssueAttachment`. It typically hands back a short-lived signed URL or a `curl`
     command rather than streaming bytes through the model — run that command yourself, then
     parse the downloaded file with the matching skill (`xlsx` for spreadsheets, `docx` for
     Word, `pdf` for PDFs).
4. If neither the description nor any attachment yields usable requirements, stop and ask the
   human to paste the acceptance criteria directly into the conversation. Do not proceed on the
   ticket title/summary alone — a topic is not a behavior.

### Phase 3: Derive test cases from the acceptance criteria

Work through the requirements source branch by branch. For each distinct scenario:

1. **Identify the behaviour and condition.** This becomes the Title's
   `<behaviour> — <condition>` (after the `[<Type>]` prefix), e.g.
   `[Negative] Login rejected for a locked-out user — correct password`.
2. **Classify the Type:**
   - **Positive** — the AC describes correct behaviour under valid input.
   - **Negative** — the AC describes a rejection: invalid input, wrong credentials,
     unauthorized access, missing required data.
   - **Edge** — behaviour the AC itself flags as unconfirmed or ambiguous, or input at the edge
     of normal usage (whitespace, unusual-but-plausible values). If the requirement doc says
     something like "confirm actual behaviour" or "raise a defect if X happens instead", that's
     a strong signal for Edge, not Positive/Negative — carry that uncertainty into the Expected
     Result rather than picking a side the source didn't commit to.
   - **Boundary** — numeric/length limits the AC explicitly states (min/max, off-by-one). Only
     emit if the AC actually states a boundary; don't invent one because "boundary testing" is
     generically good practice.
   - **Performance** — explicit timing/load/throughput requirements. Same rule: only if stated.
3. **Preconditions** — bullet list of state that must hold *before* step 1 (session state, data
   state, prior navigation already done). Not the navigation itself — that's a step.
4. **Steps** — numbered list, one concrete action per step, using the literal values from the
   AC (exact usernames, exact labels, exact URLs). Never a placeholder like "enter valid
   credentials" — if the source gives a literal value, use it.
5. **Expected Result** — the observable outcome, ending with a line that states the pass
   condition plainly, e.g. `PASS: the error banner reads exactly "..." and the user remains on
   the login page.` A reviewer should be able to read just the last line and know what "pass"
   means.
6. **Test Data** — `field: value` lines, one per line, using only values already used in Steps.
   Don't introduce new values here that weren't part of the scenario.
7. **Split, don't consolidate.** When one requirement gives several literal expected messages
   for different bad-input combinations, write one test case per combination.
8. **Generalize only when the source does.** When an AC groups several equivalent targets under
   one templated statement (e.g. "N other pages get an equivalent message, naming that page")
   rather than literal text for each, one generalized row listing every target in Test Data is
   accurate — don't invent the missing literal text per target just to give each its own row.

### Phase 4: Build the workbook

Use the `xlsx` skill. Columns in this exact order: `Title, Preconditions, Steps, Expected
Result, Test Data, Type`. One row per test case. Bold header row, wrapped body cells,
professional font, auto-filter on the header row — no formulas needed, this is a flat data
table, not a model.

Save to `test-scenarios/{area}/{summary_snake_case}_testcases.xlsx`.

### Phase 5: Hand off for review

Tell the human what was produced: row count, the Type breakdown, and which requirement
branches were split, merged, or skipped and why (especially anything the source itself flagged
as ambiguous). This is a human-review artifact — don't proceed to writing any Playwright code
from it in the same turn. Automation starts only once the human approves it, at which point
`test-standards` Phase 0 (or direct spec authoring, if they skip that gate) takes over.

## See Also

- **`references/test-case-generator.md`** — a portable, tool-agnostic version of this workflow as a
  standalone prompt (role/context/process/output-contract/constraints/example/self-check), for
  use outside this skill (another AI tool, a teammate, documentation).
- **`xlsx` skill** — how to build the workbook (formatting, save mechanics, gotchas).
- **`test-standards` skill** — the Phase 0 human-approval gate this feeds into (different
  schema — see Critical).
- **`page-objects`** / **`selectors`** / **`data-strategy`** — once test cases are approved and
  automation begins for a new area, these skills take over from here.
