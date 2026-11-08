# Project Context

> **Instructions for the AI agent:** Read this file first when starting any task in this project.
> Do NOT overwrite this file without user permission.
> Fill in every field. Leave unknown fields as `unknown` or `[]`.

---

## Project Identity

```yaml
project_name: "My Project"
version: "1.0.0"
description: "Brief description of what this project does"
repository: "https://github.com/org/repo"
```

---

## Tech Stack

```yaml
# Backend
backend_language: ""          # php, typescript, python, go, etc.
backend_framework: ""         # laravel, express, fastapi, gin, etc.
backend_version: ""           # e.g., Laravel 11, Node.js 20

# Frontend
frontend_framework: ""        # react, next, vue, nuxt, angular, none
frontend_language: ""         # typescript, javascript
styling: ""                   # tailwind, css-modules, styled-components, etc.

# Database
databases:                    # list all
  - type: ""                  # mysql, postgresql, mongodb, redis, etc.
    version: ""
    orm: ""                   # eloquent, prisma, sqlalchemy, etc.

# Infrastructure
hosting: ""                   # AWS, GCP, Azure, Vercel, Hetzner, etc.
containerized: false          # true/false
ci_cd: ""                     # GitHub Actions, GitLab CI, Bitbucket Pipelines, etc.
```

---

## Architecture

```yaml
pattern: ""         # MVC, Clean Architecture, Hexagonal, DDD, Microservices, etc.
layers:
  - name: ""        # e.g., Controllers, Services, Repositories, Models
    path: ""        # e.g., app/Http/Controllers

key_directories:
  - path: ""        # e.g., app/Services
    purpose: ""     # Business logic layer
```

---

## Development Commands

```yaml
install: "composer install && npm install"
dev_server: "php artisan serve"
build: "npm run build"
test: "php artisan test"
lint: "php cs-fixer fix --dry-run"
format: "php cs-fixer fix"
migrate: "php artisan migrate"
```

---

## Testing Setup

```yaml
backend_test_framework: ""      # phpunit, pest, pytest, jest, vitest
test_directory: "tests/"
integration_tests: false
e2e_tests: false
test_database: ""               # e.g., sqlite in-memory, test MySQL database
coverage_target: 80
```

---

## Coding Conventions

```yaml
# Naming
class_naming: ""          # PascalCase
method_naming: ""         # camelCase
variable_naming: ""       # camelCase / snake_case
file_naming: ""           # PascalCase for classes, kebab-case for components

# Formatting
indentation: 4            # spaces
max_line_length: 120
trailing_commas: true

# Specific rules (add project-specific rules here)
custom_rules:
  - ""
```

---

## Important Constraints

```yaml
# Things the AI must never do in this project
never_do:
  - "Never push to main branch directly"
  - "Never run migrations in production manually"
  - "Never bypass the OrderService for order creation"

# High-risk areas requiring extra caution
sensitive_areas:
  - path: ""
    reason: ""

# External dependencies or services this project uses
external_services:
  - name: ""
    purpose: ""
```

---

## Review and Report Settings

```yaml
report_language: "fa"       # fa = Persian (Farsi), en = English
severity_threshold: "P2"    # Minimum severity to include in reports (P0, P1, P2, P3)
auto_review_on_change: true # When true, AI automatically runs PR-Agent review after every code change prompt
```

---

## Project Notes

<!-- Add any additional context the AI should know about this project. -->
<!-- Examples: unusual conventions, legacy areas to avoid, known technical debt, etc. -->
