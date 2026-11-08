---
name: feature-development
description: >-
  Implements a new feature by first understanding requirements, inspecting
  existing architecture, presenting a plan, and implementing incrementally
  following project conventions. Use when asked to "add feature X",
  "implement Y", "build Z", "اضافه کن", "پیاده‌سازی کن".
---

# Feature Development Skill

## Instructions

Execute the Feature Development workflow from `workflows/feature-development.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/safety-policy.md`
- `.agents/project-context.md`
- Relevant standards from `standards/` based on detected tech stack.

Follow the 8-step execution sequence:
1. Understand and confirm requirements (ask max 3 clarifying questions if needed).
2. Inspect existing architecture.
3. Present implementation plan.
4. **Wait for user approval.**
5. Implement incrementally (migration → model → service → controller → tests).
6. Follow existing conventions exactly.
7. Write tests.
8. Run tests and report output.

## Key Constraints

- Present a plan and **wait for approval before writing any files**.
- Do not introduce new dependencies without approval.
- Do not modify code outside the authorized scope.
- Match existing naming conventions, file structure, and coding style exactly.
