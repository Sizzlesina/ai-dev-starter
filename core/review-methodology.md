# Code Review Methodology

> **Scope:** Core reference — loaded by the Code Review workflow.
> **Source:** Adapted from PR-Agent (Qodo / The-PR-Agent, MIT License) for IDE-native use.

---

## Philosophy

Effective code review is:
- **Diff-centric:** Focus on what changed, not the entire codebase.
- **Evidence-based:** Every finding must cite specific code.
- **Prioritized:** Not all issues are equal. Distinguish critical from cosmetic.
- **Actionable:** Every finding must suggest a concrete fix.
- **Conservative:** When uncertain, ask rather than fabricate.

---

## Review Dimensions

Inspect each changed file along these dimensions, in priority order:

### Dimension 1 — Correctness and Business Logic
- Does the code do what the commit message, PR description, or task requires?
- Are there off-by-one errors, wrong operators, or inverted conditions?
- Are null / undefined / empty values handled?
- Are error paths handled correctly?
- Are return values checked?

### Dimension 2 — Security
- Injection vulnerabilities (SQL, command, XSS, SSTI).
- Authentication and authorization gaps (missing checks, privilege escalation).
- Sensitive data exposure (logs, error messages, API responses).
- Insecure deserialization or file handling.
- Unsafe use of `eval`, `exec`, `shell_exec`, `system`.
- Missing CSRF protection on state-changing endpoints.
- Hardcoded credentials or secrets.

### Dimension 3 — Data Integrity
- Database transactions wrapping multi-step operations.
- Race conditions and concurrency issues.
- Missing foreign key constraints or on-delete behavior.
- Unsafe mass assignment.
- Migration reversibility.

### Dimension 4 — Performance
- N+1 queries (loop containing a database call).
- Missing indexes for new query patterns.
- Unbounded queries (missing LIMIT on user-controlled input).
- Synchronous blocking operations in async contexts.
- Large payload responses without pagination.

### Dimension 5 — Architecture
- Does the change respect existing layer boundaries?
- Is business logic leaking into controllers, views, or routes?
- Are dependencies introduced cleanly (not bypassing interfaces)?
- Is coupling increased unnecessarily?

### Dimension 6 — Testability and Coverage
- Does the change have unit or integration tests?
- Are critical branches covered?
- Are edge cases tested?
- Do existing tests still pass with the change?

### Dimension 7 — Code Quality
- Is the code readable and self-documenting?
- Are magic numbers or strings explained?
- Is complexity appropriate?
- Note: Flag quality issues as P3 (Low). Do not spend significant review effort on style.

---

## Verification Before Reporting

For every candidate finding:

1. **Re-read** the relevant code section.
2. **Check** whether the issue is in the new code (diff) or pre-existing.
3. **Trace** the execution path that produces the problem.
4. **Search** for mitigating factors (middleware, validators, tests).
5. **Confirm** the finding is realistic, not theoretical.

If you cannot complete steps 3–5 with concrete evidence, downgrade the finding or discard it.

---

## Finding Format

Each finding must follow this structure:

```markdown
### [SEVERITY] Short description

**File:** `path/to/file.ext`
**Line:** 42 (or range 42–55)

**Problem:**
One or two sentences describing the specific defect.

**Evidence:**
```language
// The specific code that is problematic
relevant_code_here
```

**Impact:**
Realistic description of what could happen if this is not fixed.
Avoid "could potentially maybe" language. If impact is uncertain, say so.

**Fix:**
Concrete suggestion. Code snippet if helpful.

**Verification:**
How to confirm the fix works (test command, manual step, etc.).
```

---

## Summary Report Structure

```markdown
## Review Summary

**Branch:** feature/xyz → main
**Files changed:** N
**Commits reviewed:** M

### Findings by Severity
| Severity | Count |
|----------|-------|
| P0 Critical | 0 |
| P1 High | 2 |
| P2 Medium | 3 |
| P3 Low | 4 |

### Walkthrough
<2–4 sentence summary of what this change does>

---

## Findings

<findings ordered P0 → P3>

---

## Observations
<pre-existing issues noticed but outside diff scope>

---

## Positive Notes
<what was done well — optional but encouraged>
```
