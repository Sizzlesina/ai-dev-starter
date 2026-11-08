# Workflow: Security Audit

> **Purpose:** Identify realistic security vulnerabilities in the codebase.
> **Authorization:** Read-only. No file writes. No commits.
> **Scope:** Realistic vulnerabilities only. No theoretical or low-evidence findings.

---

## Trigger

- "security audit", "security review", "vulnerability check"
- "بررسی امنیتی", "آسیب‌پذیری"

---

## Required Context

1. `core/agent-principles.md`
2. `core/severity-levels.md`
3. `.agents/project-context.md`
4. `standards/security.md`

---

## Execution Steps

### Step 1 — Define Scope

Confirm with the user:
- Full codebase audit, or specific module/endpoint?
- Recent changes only, or entire codebase?
- Any known areas of concern?

### Step 2 — Enumerate Attack Surface

```bash
# Routes and endpoints
cat routes/web.php routes/api.php 2>/dev/null
# or
grep -rn "app\.(get|post|put|delete|patch)" --include="*.js" --include="*.ts" src/ | head -30

# Authentication middleware
grep -rn "auth\|middleware\|guard\|protect" --include="*.php" routes/ app/ | head -20

# Public endpoints (no auth)
grep -rn "Route::" routes/web.php | grep -v "auth\|middleware" | head -20
```

Identify:
- All authentication entry points.
- All endpoints that mutate data.
- All endpoints that return sensitive data.
- All file upload or download handlers.
- All external service integrations.

### Step 3 — Inspect Vulnerability Categories

#### A. Injection

```bash
# SQL Injection — look for raw queries or string concatenation
grep -rn "DB::select\|DB::statement\|whereRaw\|orderByRaw\|havingRaw" --include="*.php" app/ | head -20
grep -rn "query\|exec\|execute" --include="*.js" --include="*.ts" src/ | grep "req\.\|user\.\|\$_" | head -20

# Command Injection
grep -rn "exec\|shell_exec\|system\|passthru\|popen\|proc_open" --include="*.php" app/ | head -10
grep -rn "exec\|spawn\|execSync\|execFile" --include="*.ts" --include="*.js" src/ | head -10

# XSS — unescaped output
grep -rn "echo \$\|{!!\|v-html\|dangerouslySetInnerHTML" --include="*.php" --include="*.blade.php" --include="*.tsx" . | head -20
```

#### B. Authentication and Authorization

```bash
# Missing auth middleware
grep -rn "Route::\(get\|post\|put\|delete\)" routes/ | head -30

# Authorization checks in controllers
grep -rn "\$this->authorize\|Gate::\|can(\|Policy" --include="*.php" app/Http/Controllers/ | head -20

# JWT / session validation
grep -rn "token\|jwt\|session\|cookie" --include="*.php" --include="*.ts" app/ src/ | grep -i "valid\|verif\|check" | head -10
```

#### C. Sensitive Data Exposure

```bash
# Hardcoded secrets
grep -rn "password\|secret\|key\|token" --include="*.php" --include="*.ts" --include="*.js" . \
  | grep -v "\.env\|config\|test\|spec\|\.git" \
  | grep -i "['\"].\{8,\}['\"]" | head -20

# API responses that may leak sensitive data
grep -rn "toArray\|toJson\|->makeHidden\|->makeVisible\|hidden\|visible" --include="*.php" app/Models/ | head -20

# Error messages that expose internals
grep -rn "getMessage\|getTrace\|debug.*true\|APP_DEBUG" --include="*.php" . | grep -v test | head -10
```

#### D. Mass Assignment

```bash
# Laravel: unguarded models
grep -rn "unguarded\|fillable\|guarded" --include="*.php" app/Models/ | head -20
grep -rn "\$request->all()\|\$request->input()" --include="*.php" app/Http/ | head -20
```

#### E. CSRF and Request Forgery

```bash
# Check which routes are exempt from CSRF
grep -rn "VerifyCsrfToken\|except\|csrf" --include="*.php" app/Http/Middleware/ | head -10
```

#### F. File Operations

```bash
# Unsafe file operations
grep -rn "unlink\|rename\|move\|copy\|file_put_contents" --include="*.php" app/ | head -10
grep -rn "Storage::\|File::\|Filesystem" --include="*.php" app/ | head -10

# File upload handling
grep -rn "->store\|->move\|getClientOriginalExtension\|getMimeType" --include="*.php" app/ | head -10
```

### Step 4 — Read and Analyze

For each suspicious pattern found, read the surrounding code:
- 20–50 lines of context around the finding.
- The route definition and middleware chain.
- The model's `$fillable` or `$guarded` list.

Apply the verification checklist from `core/review-methodology.md` before recording any finding.

### Step 5 — Generate Report

Report findings by severity (P0 → P3).

Include for each finding:
- Vulnerability type (from OWASP category).
- File and line number.
- Exact problematic code.
- Realistic attack scenario.
- Recommended fix.

---

## Completion Criteria

- Full attack surface enumerated.
- All six vulnerability categories inspected.
- Each finding has evidence, attack scenario, and fix.
- No speculative findings.

---

## Limitations

This workflow cannot:
- Run dynamic analysis (DAST) or penetration testing.
- Inspect third-party package source code thoroughly.
- Test cryptographic implementation correctness mathematically.
- Detect vulnerabilities requiring runtime state.
