# Workflow: Refactoring

> **Purpose:** Improve code structure and maintainability without changing observable behavior.
> **Authorization:** Read freely. Write incrementally within authorized scope.
> **Golden Rule:** If behavior changes, it is not refactoring — stop and discuss.

---

## Trigger

- "refactor", "clean up", "simplify", "improve readability"
- "ریفکتور", "بهبود کد", "ساده‌سازی"

---

## Required Context

1. `core/agent-principles.md`
2. `core/safety-policy.md`
3. `.agents/project-context.md`

---

## Execution Steps

### Step 1 — Understand Scope

Confirm:
- Which file(s) or module(s) are in scope.
- What quality problem the user wants to address.
- Whether there is existing test coverage (critical for safe refactoring).

### Step 2 — Assess Test Coverage

```bash
# Run existing tests to establish baseline
php artisan test --filter=ScopeClass
# or
npm test -- --testPathPattern=ScopedModule
```

**If no tests exist:** Alert the user.
> "⚠️ No tests found covering this code. Refactoring without tests risks introducing regressions. Recommend writing tests first. Shall I generate tests before refactoring?"

Do not proceed with refactoring on untested code without user explicit acknowledgment of the risk.

### Step 3 — Identify Improvements

Look for:

| Anti-Pattern | Description |
|---|---|
| Long method | Function > 30 lines doing multiple things |
| Deep nesting | More than 3 levels of if/loop nesting |
| Duplicated logic | Same logic copy-pasted in 2+ places |
| God class | Class doing too many unrelated things |
| Magic values | Hardcoded numbers or strings without explanation |
| Primitive obsession | Using raw strings/ints where a type/enum fits |
| Dead code | Unreachable, commented-out, or unused code |
| Leaky abstraction | Implementation details exposed across layer boundary |

### Step 4 — Present Refactoring Plan

```markdown
## Refactoring Plan: <File or Module>

**Current problems:**
1. `processOrder()` is 120 lines doing validation, calculation, and persistence.
2. Magic number `0.15` appears 4 times without explanation.
3. Nested condition depth reaches 5 levels.

**Proposed changes:**
1. Extract `validateOrder()`, `calculateTotals()`, `persistOrder()`.
2. Define `const TAX_RATE = 0.15` with a comment.
3. Replace nested conditions with early returns.

**Behavior preserved:** Yes — externally visible interface unchanged.
**Tests needed:** Existing tests will cover all changes.

Shall I proceed?
```

**Wait for approval before writing any files.**

### Step 5 — Implement in Small Steps

Apply one change category at a time:
1. Extract methods / functions.
2. Eliminate duplication.
3. Rename for clarity.
4. Remove dead code.
5. Restructure control flow.

Run tests after each step:
```bash
php artisan test --filter=ScopeClass
```

If any test fails: **stop**, report the failure, and revert the last step.

### Step 6 — Verify Behavior Preservation

After all changes:
```bash
# Run the full test suite for the affected module
php artisan test --filter=ScopeModule
```

Report actual output. Do not declare success without evidence.

---

## Boundaries

- Do not add features during refactoring.
- Do not change public APIs or interfaces.
- Do not modify database migrations.
- Do not change test assertions.
- Do not reformat code outside the changed functions.

---

## Completion Criteria

- Original behavior preserved (tests still pass).
- Code is measurably simpler (fewer lines, less nesting, less duplication).
- No scope creep.
- Tests ran and results reported.
