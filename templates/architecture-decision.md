# Architecture Decision Record (ADR)

> **Template:** Use this to document significant architectural decisions.
> **File naming:** `docs/adr/NNNN-short-title.md` (e.g., `docs/adr/0001-use-event-sourcing.md`).

---

## ADR-{{NUMBER}}: {{TITLE}}

**Status:** `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-NNN`
**Date:** YYYY-MM-DD
**Deciders:** {{names or roles}}

---

## Context

<!-- What is the situation that is forcing us to make a decision?
     What constraints or forces are at play? Be specific. -->

{{context_description}}

---

## Decision Drivers

- {{driver_1}}: e.g., "Team is unfamiliar with event sourcing"
- {{driver_2}}: e.g., "We need audit logs for compliance"
- {{driver_3}}

---

## Options Considered

### Option A: {{option_a_name}}

**Description:** {{brief description}}

**Pros:**
- {{pro_1}}

**Cons:**
- {{con_1}}

---

### Option B: {{option_b_name}}

**Description:** {{brief description}}

**Pros:**
- {{pro_1}}

**Cons:**
- {{con_1}}

---

## Decision

**Chosen:** Option {{A/B/C}}

**Rationale:**
{{1–3 paragraphs explaining why this option was chosen over the alternatives, referencing the decision drivers}}

---

## Consequences

### Positive
- {{positive_outcome_1}}

### Negative / Trade-offs
- {{trade_off_1}}

### Neutral
- {{neutral_note_1}}

---

## Implementation Notes

<!-- Specific guidance for implementing this decision. -->

{{implementation_notes_or_none}}

---

## References

- {{link_to_relevant_documentation}}
- {{link_to_related_ADR}}
