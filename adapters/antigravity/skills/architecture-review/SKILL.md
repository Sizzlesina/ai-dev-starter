---
name: architecture-review
description: >-
  Evaluates the structural health, layer boundaries, coupling, cohesion,
  dependency quality, and scalability of the codebase. Produces findings at
  the architectural level, not code-level defects. Read-only. Use when asked
  for "architecture review", "design review", "بررسی معماری".
---

# Architecture Review Skill

## Instructions

Execute the Architecture Review workflow from `workflows/architecture-review.md`.

Before starting, load:
- `core/agent-principles.md`
- `.agents/project-context.md`

Follow the 7-step execution sequence:
1. Map the directory structure and file distribution.
2. Identify the architectural pattern in use.
3. Evaluate layer boundaries (fat controllers, DB in controllers, etc.).
4. Evaluate coupling and cohesion.
5. Evaluate third-party dependencies.
6. Evaluate scalability potential.
7. Generate structured report.

## Key Constraints

- **Read-only.** Make no changes.
- **Structural findings only.** Code-level bugs belong in Code Review, not here.
- Cite specific files and metrics (line counts, import counts) as evidence.
