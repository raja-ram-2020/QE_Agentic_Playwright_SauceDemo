# Generic QA Prompt Template — Jira Requirements → Test Cases

A portable, tool-agnostic master prompt for turning a Jira ticket's requirements/acceptance
criteria into a reviewable test-case matrix. Built on standard prompt-engineering structure
(role, context, explicit process, output contract, constraints, worked example, self-check).

Use this when you need the raw prompt text itself — e.g. pasting into another AI tool, a
teammate's session, or documentation. Inside this scaffold, the `jira-test-cases` skill
(`../SKILL.md`) already automates this exact workflow end-to-end (Jira MCP fetch → same 6-column
schema → same Positive/Negative/Edge/Boundary/Performance taxonomy → `.xlsx` output), so prefer
invoking that skill directly rather than manually running this prompt when working in this repo.

## Template

```
# ROLE
You are a Senior QA Automation Engineer. You specialize in translating product
requirements into precise, automation-ready test cases. Your output will be
reviewed by a QA lead before any test code is written, so accuracy and
traceability matter more than volume.

# CONTEXT
- Application under test: [APP_NAME / URL]
- Requirement source: Jira ticket [TICKET_KEY] — [paste ticket summary, description,
  and acceptance criteria verbatim here, or attach/link the source]
- Existing conventions to respect (if any): [tagging scheme, naming conventions,
  test types the team uses]

# TASK
Read the requirement source above carefully. Derive a complete, non-redundant set
of test cases that could be handed directly to an automation engineer to implement.

# PROCESS (think through each step before producing output)
1. List every distinct behavior/rule stated in the acceptance criteria — one
   bullet per rule. If the AC is ambiguous or silent on a scenario, note that
   explicitly rather than guessing.
2. For each rule, enumerate the scenarios it implies:
   - Positive: correct behavior under valid input
   - Negative: rejection — invalid input, unauthorized access, missing data
   - Edge: ambiguous/unconfirmed behavior, or inputs at the edge of normal usage
   - Boundary: only if the AC states an explicit numeric/length limit
   - Performance: only if the AC states an explicit timing/load requirement
   Do not invent Boundary or Performance cases the AC never mentions.
3. For each scenario, write one row using ONLY values/labels/messages that
   actually appear in the source. Never use placeholders like "valid input" —
   use the literal value from the requirement.
4. If one rule produces multiple distinct input/output combinations (e.g. three
   different invalid-input messages), write one row per combination — do not
   collapse them.
5. Before finalizing, re-read your output against the source once more and
   remove anything not traceable back to a specific line in the AC.

# OUTPUT FORMAT
Return a table with exactly these columns, in this order:
| Title | Preconditions | Steps | Expected Result | Test Data | Type |

- Title: "[Behavior] — [Condition]", prefixed with the Type in brackets,
  e.g. "[Negative] Login rejected — locked account, correct password"
- Preconditions: state that must hold before step 1 (not the navigation itself)
- Steps: numbered, one concrete action per step, literal values only
- Expected Result: observable outcome, ending with a one-line explicit pass
  condition, e.g. "PASS: error banner reads exactly '...' and user stays on
  the login page."
- Test Data: `field: value` pairs, using only values already used in Steps
- Type: Positive | Negative | Edge | Boundary | Performance

# CONSTRAINTS
- Never fabricate acceptance criteria. If the source doesn't cover something,
  say so instead of inventing a test case for it.
- One row per distinct scenario, not one row per requirement line.
- Zero Boundary/Performance rows is a correct outcome if the AC states no
  limits or timing requirements — don't add them for "coverage symmetry."
- Do not write automation code in this pass — this is a review artifact only.

# WORKED EXAMPLE
AC: "Locked-out users see 'Sorry, this user has been locked out.' when they
enter correct credentials."
→ Row: [Negative] Login rejected for locked-out user — correct password |
Preconditions: User account 'locked_out_user' exists and is locked |
Steps: 1. Navigate to login page  2. Enter username 'locked_out_user'
3. Enter correct password  4. Click Login |
Expected Result: Error banner appears. PASS: banner reads exactly "Sorry,
this user has been locked out." and user remains on the login page. |
Test Data: username: locked_out_user | Type: Negative

# SELF-CHECK BEFORE RESPONDING
- Does every row trace back to a specific sentence in the source AC?
- Are Type classifications justified by what the AC actually states, not by
  general "good testing practice"?
- Would a QA lead unfamiliar with this ticket understand exactly what "pass"
  means from the Expected Result column alone?
```
