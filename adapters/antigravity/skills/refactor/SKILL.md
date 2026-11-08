---
name: refactor
description: >-
  Improves code structure and readability without changing observable behavior.
  Checks for test coverage first, presents a plan, implements step by step,
  and verifies tests still pass after each step. Use when asked to "refactor",
  "clean up", "simplify", "ریفکتور", "بهبود کد".
---

# Refactor Skill

## Instructions

Execute the Refactoring workflow from `workflows/refactor.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/safety-policy.md`
- `.agents/project-context.md`

Follow the 6-step execution sequence:
1. Understand scope.
2. Assess test coverage (warn if none, offer to generate tests first).
3. Identify improvements.
4. Present refactoring plan.
5. **Wait for user approval.**
6. Implement in small steps, running tests after each.

## Key Constraints

- **Stop immediately if any test fails.** Report and revert the last step.
- **No feature additions during refactoring.**
- **No changes to public APIs.**
- Do not reformat code outside the changed functions.
- Behavior must be observably identical before and after.
