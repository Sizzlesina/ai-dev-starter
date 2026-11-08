# Workflow: Code Review

> **Purpose:** Analyze Git changes and produce a structured, evidence-based review report.
> **Authorization:** Read-only. No file writes. No commits.
> **Report Language:** See project-context.md → `report_language` (default: Persian).

---

## Trigger

User says any of:
- "review my code", "review my changes", "code review"
- "بررسی کد", "ریویو کن"
- Provides a branch name or PR URL to review.

---

## Required Context

Before starting, load:
1. `core/agent-principles.md`
2. `core/git-analysis.md`
3. `core/review-methodology.md`
4. `core/severity-levels.md`
5. `.agents/project-context.md` (if present)

---

## Execution Steps

### Step 1 — Orient
```bash
# Confirm we are in a git repository
git rev-parse --show-toplevel

# Get current branch
git branch --show-current

# Determine comparison base
git remote show origin | grep "HEAD branch"
# Or: git symbolic-ref refs/remotes/origin/HEAD --short
```

If the user specified a branch or base, use that. Otherwise use the auto-detected base.

### Step 2 — Enumerate Changes
```bash
# Committed changes
git diff --name-status origin/main...HEAD
git log origin/main..HEAD --oneline

# Staged changes
git diff --cached --name-status

# Unstaged changes
git diff --name-status
```

Build the change summary: branch, base, file list, commit count.

### Step 3 — Read Diffs
```bash
git diff origin/main...HEAD
```

Read the full diff. For large diffs (>500 lines), process file by file.

### Step 4 — Read Affected Files

For each modified file:
1. Read the file to understand the full context of changed lines.
2. Identify what functions, classes, or modules are affected.
3. Note imports and dependencies relevant to the changes.

Do not read files that have no changes unless they are critical dependencies.

### Step 5 — Gather Supporting Context

For each finding candidate:
- Read related files (e.g., models, validators, tests, routes).
- Read migration files if schema changes are present.
- Read test files covering the changed code.

```bash
# Find tests for a changed file
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*Test.php" | \
  xargs grep -l "ClassName\|functionName" 2>/dev/null | head -10

# Find routes
grep -rn "Route::" routes/ 2>/dev/null | grep "endpoint"
```

### Step 6 — Analyze

Apply review dimensions from `core/review-methodology.md` in this order:
1. Correctness and Business Logic
2. Security
3. Data Integrity
4. Performance
5. Architecture
6. Test Coverage
7. Code Quality

For each candidate finding, complete the verification checklist before recording it.

### Step 7 — Verify Findings

For every finding:
- [ ] The issue exists in newly added lines (not pre-existing).
- [ ] I can point to the exact file, line, and code.
- [ ] I can describe the realistic impact scenario.
- [ ] I checked for mitigating factors (middleware, validators, tests).
- [ ] I can suggest a concrete fix.

Discard findings that fail this checklist.

### Step 8 — Generate Report

Produce the report in the project's configured `report_language`.

Use the report template from `templates/review-report.md`.

---

## Report Template

```markdown
## گزارش بررسی کد / Code Review Report

**شاخه (Branch):** `feature/xyz` → `main`
**تعداد فایل‌های تغییریافته:** N
**تعداد کامیت‌ها:** M
**تاریخ:** YYYY-MM-DD

---

### خلاصه تغییرات (Walkthrough)
<2–4 جمله توضیح می‌دهند که این تغییر چه می‌کند>

---

### یافته‌ها (Findings)

#### [P0 — بحرانی] <عنوان>
**فایل:** `path/to/file.php` خط ۴۲

**مشکل:** <توضیح مشکل>

**شواهد:**
```php
// کد مشکل‌دار
```

**تأثیر:** <توضیح واقع‌گرایانه>

**پیشنهاد رفع:** <راه‌حل مشخص>

**روش تأیید:** <چگونه مطمئن شویم که مشکل رفع شد>

---

### مشاهدات (Observations)
<مشکلات موجود قبلاً که خارج از محدوده تغییر هستند>

---

### نکات مثبت (Positive Notes)
<چه چیزهایی خوب انجام شده>
```

---

## Completion Criteria

- All changed files have been reviewed.
- Findings are ordered P0 → P3.
- Each finding has file, line, evidence, impact, and fix.
- No speculative findings without code-level evidence.
- Report language matches project configuration.

---

## Limitations

This workflow cannot:
- Access external CI/CD results.
- Run tests automatically.
- Review changes in external repositories without clone access.
- Detect runtime behaviors not visible in code.
