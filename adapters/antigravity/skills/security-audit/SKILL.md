---
name: security-audit
description: >-
  Performs a static security audit inspecting injection, authentication,
  authorization, sensitive data exposure, mass assignment, CSRF, and file
  operation vulnerabilities. Read-only. Use when asked for "security audit",
  "vulnerability check", "بررسی امنیتی", "آسیب‌پذیری".
---

# Security Audit Skill

## Instructions

Execute the Security Audit workflow from `workflows/security-audit.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/severity-levels.md`
- `.agents/project-context.md`
- `standards/security.md`

Follow the 7-step execution sequence:
1. Define scope with user.
2. Enumerate attack surface (routes, endpoints, auth mechanisms).
3. Inspect six vulnerability categories: Injection, Auth/AuthZ, Sensitive Data, Mass Assignment, CSRF, File Operations.
4. Read and analyze suspicious patterns.
5. Apply verification checklist per finding.
6. Generate prioritized report.

## Key Constraints

- **Read-only.** Make no changes to files.
- **Evidence-only.** Each finding must cite exact file, line, and code.
- **Realistic findings only.** No theoretical vulnerabilities without concrete attack paths.
- Apply OWASP classification to findings.
