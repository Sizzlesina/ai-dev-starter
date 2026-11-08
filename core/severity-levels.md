# Severity Classification

> **Scope:** Universal — used by all review and audit workflows.

---

## Severity Levels

### P0 — Critical

**Definition:** The issue will cause data loss, security breach, service outage, or financial loss in production under normal or near-normal usage. Requires immediate attention before merge.

**Characteristics:**
- Exploitable without special access or knowledge.
- Data corruption or exposure of sensitive user information.
- Authentication bypass or privilege escalation.
- Production crash under expected load.
- Irreversible data deletion triggered by common operations.

**Examples:**
- SQL injection in a user-facing query.
- Password stored in plaintext.
- Missing authorization check on an admin endpoint.
- Division by zero in payment calculation.
- Database write without transaction in a critical multi-step operation.

---

### P1 — High

**Definition:** The issue causes incorrect behavior, significant security weakness, or degraded reliability. Likely to impact users or data correctness. Must be fixed before merge unless risk is explicitly accepted.

**Characteristics:**
- Incorrect business logic that affects real users.
- Security weakness requiring non-trivial exploitation.
- Data integrity risk under moderate load or concurrency.
- Unhandled error that causes visible failure to users.

**Examples:**
- N+1 query that will cause timeout at production scale.
- Missing CSRF protection on a state-changing form.
- Race condition in inventory or booking logic.
- Sensitive data included in API response unnecessarily.
- Exception swallowed silently, hiding errors.

---

### P2 — Medium

**Definition:** The issue degrades quality, maintainability, or reliability without immediate user impact. Should be fixed in this PR or tracked in a follow-up task.

**Characteristics:**
- Logic that works now but is fragile or will fail under edge cases.
- Missing error handling that may surface under unusual conditions.
- Performance issue that is not yet bottlenecking but will under growth.
- Code that violates architectural patterns in a way that creates technical debt.

**Examples:**
- Missing input validation on a non-critical field.
- Hardcoded configuration value that should be an environment variable.
- Missing index for a new query pattern on a small-but-growing table.
- Function exceeding 60 lines doing multiple things.

---

### P3 — Low

**Definition:** Minor quality, style, or documentation issue. No functional impact. Consider fixing as a habit.

**Characteristics:**
- Code style inconsistency.
- Unhelpful variable names.
- Missing docblock on a public method.
- Redundant code with no behavioral effect.
- Typos in comments or strings.

**Examples:**
- Variable named `$temp` or `$data` without context.
- Missing return type declaration.
- Commented-out code left in without explanation.

---

## Severity Assignment Rules

1. **Default to lower severity** when evidence is incomplete.
2. **Upgrade to higher severity** only when you can demonstrate a concrete exploit or failure path.
3. **Security issues start at P1** unless they are trivially unexploitable, in which case P2.
4. **Data loss issues are always P0.**
5. **Style and naming issues are always P3.**
6. **Never report a P0 or P1 without code-level evidence.**

---

## Effort Estimates (Optional in Reports)

Optionally classify fixes by implementation effort:

| Label | Meaning |
|-------|---------|
| `XS`  | 1–5 minutes, one-liner fix |
| `S`   | 15–30 minutes, small change |
| `M`   | 1–4 hours, moderate refactor |
| `L`   | Half a day or more, requires planning |
