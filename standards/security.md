# Security Standards

> **Scope:** Universal application security baseline.
> **Load:** Always loaded for security-audit workflow. Referenced by code-review.

---

## OWASP Top 10 Baseline

### A01 — Broken Access Control
- Enforce authorization on every state-changing request.
- Deny by default. Grant access explicitly.
- Do not rely on obscure URLs or hidden UI elements for access control.
- Validate that the authenticated user owns or has rights to each resource they access.

### A02 — Cryptographic Failures
- Use TLS 1.2+ for all data in transit.
- Use AES-256 for symmetric encryption at rest.
- Use bcrypt, argon2, or scrypt for password hashing.
- Never roll custom cryptographic algorithms.
- Rotate keys and manage them through a secrets manager, not source code.

### A03 — Injection
- Use parameterized queries or ORMs for all database interactions.
- Never pass user input to `eval`, `exec`, `shell_exec`, `system`, or similar.
- Sanitize and encode output before rendering in HTML (use framework templating engines).
- Validate file paths — prevent directory traversal.

### A04 — Insecure Design
- Apply the principle of least privilege to all roles and service accounts.
- Design rate limiting for authentication endpoints and sensitive operations.
- Limit failed login attempts (lockout or CAPTCHA after N failures).

### A05 — Security Misconfiguration
- Disable debug mode and verbose errors in production.
- Remove default accounts and credentials.
- Apply security headers: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`.
- Review and restrict CORS policies — do not allow `*` for credentialed requests.

### A06 — Vulnerable and Outdated Components
- Track direct dependencies for known CVEs.
- Run `composer audit`, `npm audit`, or `pip-audit` as part of CI.
- Update dependencies regularly, especially for security patches.

### A07 — Identification and Authentication Failures
- Use multi-factor authentication for administrative access.
- Use secure, `HttpOnly`, `Secure`, `SameSite=Strict` cookie attributes.
- Implement CSRF protection for all state-changing form submissions.
- Invalidate sessions after logout and after password change.

### A08 — Software and Data Integrity Failures
- Verify file checksums or signatures for critical downloads.
- Use lockfiles (`composer.lock`, `package-lock.json`) for reproducible builds.
- Do not deserialize untrusted data without strict type validation.

### A09 — Security Logging and Monitoring
- Log authentication events, permission denials, and input validation failures.
- Do not log sensitive data (passwords, tokens, PII).
- Set up alerts for suspicious patterns (many failed logins, unusual data volumes).

### A10 — Server-Side Request Forgery (SSRF)
- Validate and allowlist URLs before making server-side HTTP requests.
- Block requests to internal IP ranges (169.254.x.x, 10.x.x.x, 172.16-31.x.x, 192.168.x.x).
- Do not use user-provided URLs in server-side HTTP calls without validation.

---

## Credential Management

- Store all secrets in environment variables or a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager).
- Never commit secrets, API keys, or passwords to version control.
- Use `.gitignore` to exclude `.env` files.
- Rotate credentials when team members leave.
- Audit `.git` history if a credential has been accidentally committed.

---

## API Security

- Authenticate all API endpoints unless explicitly designed to be public.
- Rate limit all APIs — especially auth, registration, and search.
- Return generic error messages for auth failures (do not reveal whether a user exists).
- Version APIs — do not break existing clients with silent changes.
- Validate `Content-Type` on request bodies.
