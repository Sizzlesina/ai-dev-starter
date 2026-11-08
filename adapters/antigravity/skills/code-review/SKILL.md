---
name: code-review
description: >-
  Performs a structured, evidence-based code review of current Git changes.
  Reviews committed, staged, and unstaged changes. Produces a prioritized
  findings report with file/line citations. Use when asked to "review my code",
  "code review", "بررسی کد", or "ریویو کن".
---

# Code Review Skill

## Instructions

Execute the Code Review workflow from `workflows/code-review.md`.

Before starting, load:
- `core/agent-principles.md`
- `core/git-analysis.md`
- `core/review-methodology.md`
- `core/severity-levels.md`
- `.agents/project-context.md` (if present in the project)

Then follow the 8-step execution sequence defined in `workflows/code-review.md`.

## Key Constraints

- **Read-only.** Do not modify any files.
- **Evidence-only.** Every finding must include file path, line number, and code evidence.
- **No speculation.** Do not report issues you cannot trace to specific changed lines.
- **Report language:** Use the `report_language` from `.agents/project-context.md` (default: Persian).

## Output

A structured review report following the template in `templates/review-report.md`.
