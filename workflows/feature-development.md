# Workflow: Feature Development

> **Purpose:** Implement a new feature following the project's existing architecture and conventions.
> **Authorization:** Read freely. Write incrementally within authorized scope.
> **Auto-commit:** Never.

---

## Trigger

User requests a new feature:
- "add feature X", "implement Y", "build Z"
- "اضافه کن", "پیاده‌سازی کن", "بساز"

---

## Required Context

1. `core/agent-principles.md`
2. `core/safety-policy.md`
3. `.agents/project-context.md`
4. Relevant standards from `standards/` based on project tech stack.

---

## Execution Steps

### Step 1 — Understand Requirements

Before writing a single line of code, confirm:
- **What** the feature does (user-facing behavior).
- **Who** uses it (user role, API consumer, background job).
- **Where** it integrates with existing functionality.
- **What it must not do** (constraints, out-of-scope items).

If the requirements are ambiguous, ask targeted questions. Maximum 3 questions at a time.

### Step 2 — Inspect Existing Architecture

```bash
# Understand project structure
ls -la
cat composer.json  # or package.json

# Find similar existing features
grep -rn "similarPattern\|relatedFeature" src/ --include="*.php" -l | head -10

# Understand routing conventions
cat routes/web.php  # Laravel
cat routes/api.php
# or
find . -name "*.routes.*" -not -path "*/node_modules/*" | head -5

# Understand data models
ls app/Models/ 2>/dev/null || ls src/entities/ 2>/dev/null || echo "Check project structure"

# Check test conventions
ls tests/ 2>/dev/null; ls __tests__/ 2>/dev/null; ls spec/ 2>/dev/null
```

Identify:
- The project's layering pattern (MVC, Clean Architecture, etc.).
- Naming conventions from existing code.
- Reusable components (services, repositories, hooks, utilities).
- The testing framework and test file location conventions.

### Step 3 — Present Implementation Plan

Before writing code, present a plan:

```markdown
## Implementation Plan: <Feature Name>

**Approach:** <One paragraph describing the technical approach>

**Files to create:**
- `app/Http/Controllers/FeatureController.php` — HTTP handler
- `app/Services/FeatureService.php` — Business logic
- `app/Models/Feature.php` — Data model (if new)
- `database/migrations/xxxx_create_features_table.php` — Schema
- `tests/Feature/FeatureTest.php` — Feature tests

**Files to modify:**
- `routes/api.php` — Add new endpoints
- `app/Providers/AppServiceProvider.php` — Register service (if needed)

**Dependencies introduced:** None

**Breaking changes:** None

**Estimated scope:** Medium

Shall I proceed with this plan?
```

**Wait for user approval before writing any files.**

### Step 4 — Implement Incrementally

Implement one logical unit at a time:
1. Database schema / migration (if needed).
2. Data model.
3. Business logic layer (service, use case).
4. HTTP / API layer (controller, route).
5. Frontend (component, page, hook) if applicable.
6. Tests.

After each unit, describe what was done and what comes next.

### Step 5 — Follow Existing Conventions

- Match the naming patterns from similar existing code (do not invent new patterns).
- Match the import style.
- Match the error handling style.
- Match the validation approach.
- Do not introduce new linting rules or formatting changes.

### Step 6 — Write Tests

Identify what must be tested:
- Happy path.
- Expected failure cases (validation errors, not-found, unauthorized).
- Edge cases specific to this feature.

Write tests compatible with the project's existing testing setup.

### Step 7 — Self-Review

Before declaring completion, run the Code Review workflow mentally on your own changes:
- Security: Are inputs validated and sanitized?
- Authorization: Are endpoints protected?
- Data integrity: Are mutations wrapped in transactions?
- Performance: Any N+1 queries introduced?

### Step 8 — Run Tests

```bash
# Run only the new feature tests
php artisan test --filter=FeatureName
# or
npm test -- --testPathPattern=FeatureName
```

Report actual test output.

---

## Completion Criteria

- Requirements confirmed before implementation.
- Plan approved by user before writing files.
- Implementation follows existing conventions.
- Tests written and passing.
- No unrelated code changed.
