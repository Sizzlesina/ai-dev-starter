# Safety Policy

> **Scope:** Universal — applies to every workflow and IDE.
> **Trigger:** Always loaded alongside agent-principles.md.

---

## Destructive Action Protocol

Before executing any action that is **irreversible or high-risk**, you must:

1. **Identify** the action as destructive (see classification below).
2. **State** clearly what you are about to do, what files or data will be affected.
3. **Request explicit approval** using language such as:
   > "This action will delete X. Please confirm by typing 'yes, proceed'."
4. **Wait** for the user's written confirmation before proceeding.
5. **Abort** if confirmation is ambiguous or absent.

---

## Destructive Action Classification

### Always Requires Confirmation
- Deleting files or directories.
- Dropping database tables, collections, or indexes.
- Running `git reset --hard`, `git clean -fd`, or similar destructive Git commands.
- Overwriting a file that the user may have modified manually.
- Running `rm`, `rmdir`, `del`, or equivalent destructive shell commands.
- Disabling or removing authentication or authorization checks.
- Modifying production environment variables or secrets.

### Requires Scope Confirmation
- Making changes to more than 5 files in a single operation.
- Modifying CI/CD pipeline definitions.
- Changing database migration files after they have been applied.
- Altering shared library code that affects multiple services.

### Never Permitted (No Override)
- Automatically pushing to `main`, `master`, `production`, or `release` branches.
- Automatically merging pull requests.
- Executing deployment commands.
- Accessing or logging credentials, tokens, or private keys.
- Making HTTP requests to external services without user awareness.

---

## Credential Safety

- Never read `.env`, `*.key`, `*.pem`, `secrets.yaml`, or similar files for any reason other than confirming their existence.
- Never print, log, or include credential values in reports or responses.
- When referencing configuration that contains credentials, refer only to the key name, not the value.

---

## Conflict Detection

When the installation CLI detects that a target file already exists and may have been user-modified:
1. Show a diff between the existing file and the new version.
2. Ask the user to choose: `keep`, `overwrite`, `merge`, or `skip`.
3. Never silently overwrite.

---

## Audit Trail

For every file modified during an implementation workflow, the agent must:
- State the file path.
- State the nature of the change (added / modified / deleted).
- State the reason for the change.
- Not proceed to the next file until the current change is confirmed or the user has acknowledged the plan.
