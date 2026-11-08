---
name: performance-audit
description: >-
  Identifies measurable performance bottlenecks in database queries, API calls,
  frontend rendering, and background jobs. Prioritizes evidence-supported issues
  over theoretical ones. Read-only. Use when asked for "performance audit",
  "slow queries", "optimize", "بررسی کارایی", "کوئری کند".
---

# Performance Audit Skill

## Instructions

Execute the Performance Audit workflow from `workflows/performance-audit.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/severity-levels.md`
- `.agents/project-context.md`

Follow the 7-step execution sequence:
1. Define scope.
2. Database query analysis (N+1, missing indexes, unbounded queries).
3. API and HTTP analysis (synchronous calls, missing caching).
4. Frontend analysis (bundle size, non-lazy routes, unnecessary renders).
5. Background job analysis.
6. Assess each finding for evidence and scale impact.
7. Generate report.

## Key Constraints

- **Read-only.** Make no changes.
- **Evidence-supported findings only.** Speculative performance concerns are not reported.
- Each finding must include estimated impact at realistic scale.
