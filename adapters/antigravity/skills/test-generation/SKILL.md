---
name: test-generation
description: >-
  Generates meaningful tests for existing or new code using the project's
  established testing framework. Identifies test cases, presents a plan,
  generates tests following project conventions, and runs them. Use when asked
  to "generate tests", "write tests", "add tests", "تست بنویس", "تست اضافه کن".
---

# Test Generation Skill

## Instructions

Execute the Test Generation workflow from `workflows/test-generation.md`.

Before starting, load:
- `core/agent-principles.md`
- `.agents/project-context.md`
- `standards/testing.md`

Follow the 6-step execution sequence:
1. Identify testing framework and conventions from existing setup.
2. Read and understand the target code.
3. Identify test cases (happy path, errors, edge cases, security).
4. Present test plan.
5. **Wait for user approval.**
6. Generate tests following existing conventions exactly, then run them.

## Key Constraints

- **Use only the testing framework already in the project.** No new testing dependencies.
- Tests must follow the existing naming conventions and file organization.
- Run generated tests and report actual output.
- Do not test implementation details — test observable behavior.
