---
name: bug-fix
description: >-
  Investigates a reported bug, identifies root cause with evidence, proposes a
  minimal fix, and implements only after user approval. Use when the user shares
  an error message, stack trace, test failure, or describes unexpected behavior.
  Trigger phrases: "fix this bug", "this is broken", "باگ", "خطا".
---

# Bug Fix Skill

## Instructions

Execute the Bug Fix workflow from `workflows/bug-fix.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/safety-policy.md`
- `.agents/project-context.md`

Follow the 8-step execution sequence:
1. Understand the bug report.
2. Establish evidence (search, grep, read).
3. Identify root cause.
4. Identify affected code.
5. Propose fix (with plan).
6. **Wait for explicit user approval.**
7. Implement.
8. Run tests and report output.

## Key Constraints

- **Never implement without user approval** of the proposed fix plan.
- **Minimal change only.** Do not fix unrelated issues encountered during investigation.
- **Never auto-commit** the fix.
- Run only the tests relevant to the fix — report actual output.
