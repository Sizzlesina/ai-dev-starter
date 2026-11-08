# Workflow: Performance Audit

> **Purpose:** Identify measurable or evidence-supported performance bottlenecks.
> **Authorization:** Read-only. No file writes.
> **Principle:** Prioritize evidence-supported issues over theoretical ones.

---

## Trigger

- "performance audit", "slow queries", "optimize", "performance review"
- "بررسی کارایی", "بهینه‌سازی", "کوئری کند"

---

## Required Context

1. `core/agent-principles.md`
2. `core/severity-levels.md`
3. `.agents/project-context.md`

---

## Execution Steps

### Step 1 — Define Scope

Confirm:
- Specific area (database, frontend, API, background jobs) or full audit?
- Any known slow endpoints or operations?
- Current scale (approximate record counts, concurrent users).

### Step 2 — Database Query Analysis

#### N+1 Query Detection
```bash
# Laravel: look for loops that contain queries
grep -rn "foreach\|for (" --include="*.php" app/ | head -20
# Then manually inspect each loop body for ORM calls

# Check for missing eager loading
grep -rn "->get()\|->first()\|->find(" --include="*.php" app/ | head -20

# Look for ->with() usage (eager loading)
grep -rn "->with(\|->load(" --include="*.php" app/ | head -20
```

#### Missing Indexes
```bash
# Find migration files and check indexed columns
find database/migrations -name "*.php" | xargs grep -l "index\|foreign\|unique" | head -10
# Review recent migrations
ls -t database/migrations | head -5 | xargs -I{} cat database/migrations/{}
```

#### Unbounded Queries
```bash
# Queries without pagination or LIMIT
grep -rn "->get()\|->all()\|SELECT \*" --include="*.php" --include="*.ts" app/ src/ | \
  grep -v "paginate\|limit\|take\|LIMIT" | head -20
```

#### Expensive Aggregations
```bash
grep -rn "->count()\|->sum()\|->avg()\|->max()\|->min()" --include="*.php" app/ | head -20
```

### Step 3 — API and HTTP Analysis

```bash
# Synchronous external HTTP calls
grep -rn "Http::\|curl_exec\|file_get_contents.*http\|axios\.\|fetch(" --include="*.php" --include="*.ts" app/ src/ | head -20

# Large response payloads
grep -rn "toArray()\|->toJson()\|json_encode" --include="*.php" app/ | head -20

# Missing caching
grep -rn "Cache::\|Redis::\|remember\|cache(" --include="*.php" app/ | head -20
# If caching is absent in hot paths, flag for investigation
```

### Step 4 — Frontend / Rendering Analysis

```bash
# Large bundle imports
grep -rn "import \* as\|require(" --include="*.ts" --include="*.tsx" --include="*.js" src/ | head -20

# Non-lazy-loaded routes
grep -rn "import {" --include="*.tsx" --include="*.ts" src/app/ | head -20

# Missing React.memo / useMemo / useCallback on expensive components
grep -rn "useEffect\|useState" --include="*.tsx" src/ | head -20
```

### Step 5 — Background Jobs

```bash
# Large job payloads
grep -rn "dispatch\|Queue::" --include="*.php" app/ | head -20

# Synchronous operations in job handlers
grep -rn "Http::\|curl\|file_get_contents" --include="*.php" app/Jobs/ | head -20
```

### Step 6 — Analyze Findings

For each potential performance issue, assess:
- **Measurable?** Can the impact be quantified or is it theoretical?
- **Scale-dependent?** At what data volume or request rate does this become a problem?
- **Evidence?** Can you identify the specific query, loop, or call that is slow?

Do not report speculative performance concerns without evidence.

### Step 7 — Generate Report

```markdown
## Performance Audit Report

**Scope:** [Module / Full Codebase]
**Date:** YYYY-MM-DD

---

### Critical Issues (P0–P1)

#### [P1] N+1 Query in OrderController::index

**File:** `app/Http/Controllers/OrderController.php` line 45

**Problem:**
Loop fetches related `Customer` model for each `Order` individually.

**Evidence:**
```php
foreach ($orders as $order) {
    $customerName = $order->customer->name; // DB query per iteration
}
```

**Impact at scale:**
100 orders → 101 queries. 10,000 orders → 10,001 queries. Response time degrades linearly.

**Fix:**
```php
$orders = Order::with('customer')->paginate(50);
```

**Verification:**
Enable query logging: `DB::enableQueryLog()`. Confirm single query after fix.

---
```

---

## Completion Criteria

- Database query patterns inspected.
- N+1 risks identified with specific code locations.
- Missing indexes identified where queries exist on unindexed columns.
- Each finding has evidence and estimated impact at scale.

---

## Limitations

- Cannot profile actual query execution plans without database access.
- Cannot measure frontend bundle sizes without build output.
- Cannot identify application-layer bottlenecks without profiling tools (Telescope, Xdebug, New Relic).
