# Backend Code Standards

> **Scope:** Universal backend principles. Technology-specific extensions are in project-context.md.
> **Load:** On demand when performing backend reviews or development.

---

## Universal Principles

### Error Handling
- Never swallow exceptions silently (`catch {}` without logging or re-throwing).
- Return consistent error formats from APIs (standardized error envelope).
- Distinguish between client errors (4xx) and server errors (5xx).
- Do not expose internal stack traces or database errors to API consumers.

### Input Validation
- Validate all input at the entry point (controller, job handler, CLI command).
- Validate type, format, range, and length.
- Reject unexpected fields (allowlist approach, not denylist).
- Return specific, actionable validation error messages to the client.

### Database Interactions
- Use parameterized queries or ORM query builders. Never concatenate user input into SQL.
- Wrap multi-step mutations in transactions.
- Use `SELECT` with explicit column lists, not `SELECT *` in production code.
- Add `LIMIT` to any query that could return unbounded results.

### Authentication and Authorization
- Authenticate identity before any data operation.
- Authorize the specific action after authentication.
- Use established, framework-provided mechanisms — do not roll custom auth.
- Expire tokens and sessions. Implement refresh token rotation.

### Logging
- Log security-relevant events: login, logout, permission denial, data export.
- Never log credentials, tokens, passwords, or PII.
- Include correlation IDs for request tracing.

---

## PHP / Laravel Specifics

### Eloquent
- Define `$fillable` on all models. Never use `$guarded = []` in production.
- Use eager loading (`with()`) to prevent N+1 queries.
- Scope complex queries to dedicated query scopes or repository classes.
- Use `firstOrFail()` / `findOrFail()` for user-facing lookups.

### Services
- One responsibility per service class.
- Inject dependencies via constructor, not facade or static calls, in service classes.
- Return typed results (custom response objects or typed arrays) rather than raw arrays.

### Commands and Jobs
- Validate input data before long-running operations.
- Implement idempotency for jobs that may be retried.
- Use `$this->fail()` explicitly when a job should not be retried.

---

## Node.js / TypeScript Specifics

### Async
- Use `async/await` throughout. Avoid callback style in new code.
- Handle Promise rejections. Never leave unhandled rejections.
- Do not block the event loop with synchronous I/O in request handlers.

### Type Safety
- Prefer `unknown` over `any` for external data.
- Validate and narrow external data at boundaries (API responses, request bodies).
- Use Zod, io-ts, or similar for runtime type validation.

### Error Handling
- Use `Result` types or typed error classes rather than relying on caught `Error` objects.
- Never use `try/catch` to suppress errors — rethrow or handle explicitly.

---

## Python Specifics

- Use type annotations (`def fn(x: int) -> str`).
- Validate external data with Pydantic or similar.
- Use context managers (`with`) for resource cleanup.
- Prefer explicit error handling over broad `except Exception`.
