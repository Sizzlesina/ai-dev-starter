# Workflow: Bug Fix

> **Purpose:** Investigate a reported bug, identify root cause, and implement a minimal fix.
> **Authorization:** Read files freely. Write only to fix-related files. Run tests with user awareness.
> **Auto-commit:** Never.

---

## Trigger

User reports a bug with any of:
- Error message, stack trace, or log output.
- Description of unexpected behavior.
- Test failure name.
- "باگ", "خطا", "bug fix", "fix this error"

---

## Required Context

1. `core/agent-principles.md`
2. `core/safety-policy.md`
3. `.agents/project-context.md`

---

## Execution Steps

### Step 1 — Understand the Bug Report

Ask for clarification only if the minimum required information is absent:
- **What is the unexpected behavior?** (or error message / stack trace)
- **What was the expected behavior?**
- **How to reproduce?** (steps, URL, command, test name)

If the user has provided a stack trace or error message, proceed without asking.

### Step 2 — Establish Evidence

```bash
# Check git status to understand current state
git status
git log --oneline -10

# Search for the error message in source
grep -rn "ErrorMessage\|ExceptionClass" --include="*.php" --include="*.ts" src/

# Find the failing test if applicable
grep -rn "test_name\|it('description'" tests/ --include="*.php" --include="*.ts"
```

Do not claim to have reproduced the bug unless you have executed the reproduction steps and observed the failure.

### Step 3 — Identify Root Cause

Trace the execution path:
1. Entry point (route, CLI command, event handler).
2. Each function call in the stack.
3. The specific line that produces the incorrect behavior.
4. The underlying condition that triggers it.

Document the root cause hypothesis before proposing a fix.

### Step 4 — Identify Affected Code

```bash
# Find all usages of the affected function/class
grep -rn "functionName\|ClassName" --include="*.php" src/ | grep -v "\.git"

# Find related tests
find tests/ -name "*Test*" | xargs grep -l "ClassName" 2>/dev/null
```

Determine:
- Minimum scope of the fix (single line, function, class).
- Whether the fix could affect other callers.
- Whether existing tests cover the fix path.

### Step 5 — Propose Fix

Present the fix plan to the user before implementing:

```markdown
## Proposed Fix

**Root Cause:** <one sentence>

**Fix Scope:** `path/to/file.php` line 42–55

**Change:**
```php
// Before
$result = $value / $count;

// After (handles zero count)
$result = $count > 0 ? $value / $count : 0;
```

**Side Effects:** None — this function is only called from X and Y.

**Tests to run:** `php artisan test --filter=TestClassName`

Shall I implement this fix?
```

**Wait for user approval before modifying any files.**

### Step 6 — Implement

After approval:
1. Apply the minimal change.
2. Do not reformat unrelated code.
3. Do not rename unrelated variables.
4. Do not add unrelated improvements.

### Step 7 — Run Tests

```bash
# Run the relevant tests (not the full suite unless needed)
php artisan test --filter=TestName
# or
npm test -- --testPathPattern=ComponentName
# or
pytest tests/test_module.py::test_function
```

Report the actual test output. Do not claim tests passed without evidence.

### Step 8 — Explain the Change

Provide:
1. Summary of what changed and why.
2. Test results (actual output).
3. Any follow-up concerns (related code that may have the same bug).

---

## Completion Criteria

- Root cause identified and documented.
- Minimal fix implemented (no scope creep).
- Relevant tests run and results reported.
- User explicitly approved the fix before implementation.

---

## Boundaries

Do not fix unrelated issues encountered during investigation. Note them separately as observations.
