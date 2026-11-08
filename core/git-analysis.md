# Git Analysis Methodology

> **Scope:** Core reference — loaded by Code Review and other diff-aware workflows.

---

## 1. Branch Detection

```bash
# Identify current branch
git branch --show-current

# Identify the default remote branch (comparison target)
git remote show origin | grep "HEAD branch"

# Or use symbolic ref
git symbolic-ref refs/remotes/origin/HEAD --short
```

Comparison branch priority:
1. Explicitly provided by the user.
2. `main` if it exists remotely.
3. `master` if `main` does not exist.
4. The branch's tracking remote branch if available.
5. Ask the user if none of the above can be determined.

---

## 2. Change Inspection Sequence

Execute in this order. Stop reading further categories once you have found sufficient context.

### 2.1 Committed Changes (Branch vs Base)
```bash
# Files changed
git diff --name-status origin/main...HEAD

# Full diff of committed changes
git diff origin/main...HEAD

# Commit log
git log origin/main..HEAD --oneline
```

### 2.2 Staged Changes
```bash
git diff --cached
git diff --cached --name-status
```

### 2.3 Unstaged Changes
```bash
git diff
git diff --name-status
```

### 2.4 Untracked Files (Relevant Only)
```bash
git ls-files --others --exclude-standard
```
Read untracked files only if they appear to be new feature files, configuration, or migration files relevant to the review scope.

---

## 3. Diff Interpretation Rules

These rules are adapted from PR-Agent's diff-centric review principles:

### Focus on the Delta
- Review only what changed (lines beginning with `+` in unified diff).
- Do not critique unchanged pre-existing code unless a change directly exposes a problem in that code.
- If existing code has a defect that is unrelated to the current changes, note it separately as an observation, not a primary finding.

### Anti-Speculation Rule
- Do not speculate that a change "might break" something unless you can:
  1. Identify the specific call site, import, or dependency that is affected.
  2. Trace the execution path that leads to the breakage.
  3. Provide the exact code location as evidence.
- Phrases like "this could cause issues" without evidence are prohibited in findings.

### Boundary Awareness
- A diff hunk that ends at an opening brace (`{`) or control flow keyword does not indicate a syntax error.
- Assess the complete function or block by reading the surrounding file when necessary.

### Context Gathering
- When a changed line references a function, class, or constant defined elsewhere, read the definition before forming a conclusion about correctness.
- When a changed line modifies a database query, read the schema file or migration files.
- When a changed line modifies an API endpoint, read the route definition and middleware.

---

## 4. File Reading Strategy

```bash
# Read a specific file
cat <filepath>

# Read specific line range
sed -n '45,90p' <filepath>

# Search for a symbol definition
grep -rn "function\|class\|def\|const " --include="*.php" -l | head -20
grep -n "functionName\|ClassName" <filepath>
```

Prefer targeted reads. Read the minimum necessary to understand the context of each finding.

---

## 5. Dependency Analysis

For each changed file, identify:
1. What it imports / requires.
2. What other files import / require it.
3. What tests cover it.

```bash
# PHP
grep -rn "use\|require\|include" --include="*.php" src/ | grep "ClassName"

# JavaScript / TypeScript
grep -rn "import\|require" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep "moduleName"

# Find tests
find . -name "*.test.*" -o -name "*.spec.*" | xargs grep "ClassName\|functionName" 2>/dev/null
```

---

## 6. Output: Change Summary

Before producing findings, construct an internal summary:

```
Branch: <name>
Base: <comparison target>
Files changed: <count>
Commits: <count>
Staged changes: <yes/no>
Unstaged changes: <yes/no>

Changed files:
- <file> (<added> additions, <removed> deletions)
...

Affected modules/components:
- <module> (reason: <file or import chain>)
```

This summary is used internally to focus the review and may be shown as context in the report.
