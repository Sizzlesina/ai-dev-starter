# Workflow: Architecture Review

> **Purpose:** Evaluate the structural health, design quality, and scalability of the codebase.
> **Authorization:** Read-only. No file writes.
> **Scope:** Structural patterns, not code-level defects (use Code Review for those).

---

## Trigger

- "architecture review", "design review", "evaluate structure"
- "بررسی معماری", "ارزیابی ساختار"

---

## Required Context

1. `core/agent-principles.md`
2. `.agents/project-context.md`

---

## Execution Steps

### Step 1 — Map the Structure

```bash
# High-level directory tree
find . -maxdepth 3 -not -path "*/.git/*" -not -path "*/node_modules/*" \
  -not -path "*/vendor/*" -not -path "*/__pycache__/*" | sort | head -100

# Count files by type
find . -name "*.php" -not -path "*/vendor/*" | wc -l
find . -name "*.ts" -not -path "*/node_modules/*" | wc -l

# Largest files (complexity indicator)
find . -name "*.php" -not -path "*/vendor/*" | xargs wc -l 2>/dev/null | sort -rn | head -20

# Dependency manifest
cat composer.json 2>/dev/null || cat package.json 2>/dev/null
```

### Step 2 — Identify the Architectural Pattern

Determine which pattern(s) the project uses:
- **MVC** (Laravel, Ruby on Rails, Django).
- **Clean Architecture / Hexagonal** (domain, application, infrastructure layers).
- **Domain-Driven Design** (bounded contexts, aggregates).
- **Microservices** (multiple services with their own data stores).
- **Monolith with modules**.
- **Component-based** (React, Vue, Angular with feature directories).

Identify by reading:
- Directory structure.
- Base classes and interfaces.
- Naming conventions.
- Dependency injection setup.

### Step 3 — Evaluate Layer Boundaries

For each identified layer boundary, check:

#### Controllers / Route Handlers
- Do they contain business logic? (Anti-pattern: fat controllers)
- Do they directly query the database? (Anti-pattern: bypassing service layer)
- Do they handle authorization? (Expected: middleware or policy)

```bash
# Check controller file sizes
wc -l app/Http/Controllers/*.php | sort -rn | head -10

# Look for direct DB calls in controllers
grep -rn "DB::\|->where\|->find\|->create" --include="*.php" app/Http/Controllers/ | head -10
```

#### Service / Use Case Layer
- Is business logic centralized here?
- Are services reusable across controllers and jobs?

#### Data Layer
- Are repositories or Eloquent models the data access mechanism?
- Is there a consistent pattern?

#### Frontend (if applicable)
- Are components responsible for data fetching? (Acceptable in React, problematic if mixed with business logic)
- Is state management centralized appropriately?

### Step 4 — Evaluate Coupling and Cohesion

**Tight Coupling Signals:**
```bash
# Classes importing many other classes
grep -rn "^use " --include="*.php" app/Http/Controllers/ | awk '{print NF}' | sort -rn | head -10

# Circular dependencies
# (Manual inspection: Class A imports B, B imports A)
grep -rn "^use App\\" --include="*.php" app/Services/ | head -20
```

**Low Cohesion Signals:**
- Classes with many unrelated public methods.
- Files > 500 lines.
- Controllers with methods for unrelated entities.

### Step 5 — Evaluate Dependencies

```bash
# Third-party dependencies
cat composer.json | grep -A100 '"require"' | grep -v "php\|ext-"
# or
cat package.json | grep -A100 '"dependencies"'
```

Assess:
- Are dependencies actively maintained?
- Are there multiple packages solving the same problem?
- Are there unnecessary dependencies for simple tasks?

### Step 6 — Evaluate Scalability

Consider:
- **Database:** Are there single points of contention (table locks, unindexed joins)?
- **State:** Is application state stored in-process (limits horizontal scaling)?
- **Queues:** Are heavy operations async?
- **Caching:** Is expensive computation cached?

### Step 7 — Generate Report

```markdown
## Architecture Review Report

**Project:** <name>
**Pattern:** <identified pattern>
**Date:** YYYY-MM-DD

---

### Executive Summary
<3–5 sentences: overall health, main strengths, main concerns>

---

### Strengths
- <What the architecture does well>

---

### Concerns

#### [P1] Fat Controllers — Business Logic Leaking from Service Layer
**Evidence:** `OrderController.php` (342 lines) contains pricing calculations, inventory checks, and email sending.
**Impact:** Logic cannot be reused, cannot be unit tested in isolation, and grows indefinitely.
**Recommendation:** Extract to `OrderService` with clearly named methods.

---

### Recommendations
1. <Highest priority structural improvement>
2. ...

---

### Dependency Health
| Package | Status | Concern |
|---------|--------|---------|
| `laravel/framework` | Current | None |
| `abandoned/package` | Abandoned | Replace with X |
```

---

## Completion Criteria

- Project structure mapped and pattern identified.
- Layer boundaries evaluated.
- Coupling and cohesion assessed.
- Dependencies reviewed.
- Findings are structural, not code-level.

---

## Limitations

- Cannot evaluate runtime behavior or actual performance.
- Cannot evaluate team conventions or processes.
- Cannot assess security of infrastructure or deployment.
