/**
 * detector.js - Project Context Detector for ai-dev-starter
 * 
 * Inspects a repository to detect tech stack, frameworks, test setups,
 * database usage, directories, and development commands.
 * Zero external dependencies.
 */

const fs = require('fs');
const path = require('path');

function safeReadJson(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {
    // Malformed JSON or read error
  }
  return null;
}

function safeReadFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch {}
  return '';
}

function dirExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Detect project metadata and architecture
 */
function detectProjectContext(projectRoot) {
  const context = {
    projectName: path.basename(projectRoot) || 'Unknown Project',
    version: '1.0.0',
    description: '',
    repository: '',
    backendLanguage: '',
    backendFramework: '',
    backendVersion: '',
    frontendLanguage: '',
    frontendFramework: 'none',
    styling: '',
    databases: [],
    architecturePattern: 'Modular / Layered',
    layers: [],
    keyDirectories: [],
    commands: {
      install: '',
      dev_server: '',
      build: '',
      test: '',
      lint: '',
      migrate: '',
    },
    testFramework: '',
    testDirectory: 'tests',
    reportLanguage: 'fa',
    severityThreshold: 'P2',
    constraints: [],
  };

  // 1. Detect Composer (PHP / Laravel / Symfony)
  const composerJsonPath = path.join(projectRoot, 'composer.json');
  const composer = safeReadJson(composerJsonPath);
  if (composer) {
    if (composer.name) context.projectName = composer.name.split('/').pop() || context.projectName;
    if (composer.description) context.description = composer.description;
    context.backendLanguage = 'php';

    const req = { ...(composer.require || {}), ...(composer['require-dev'] || {}) };

    if (req['laravel/framework']) {
      context.backendFramework = 'laravel';
      context.backendVersion = req['laravel/framework'];
      context.architecturePattern = 'MVC (Laravel)';
      context.commands.dev_server = 'php artisan serve';
      context.commands.migrate = 'php artisan migrate';
      context.databases.push({ type: 'mysql / postgresql', orm: 'eloquent' });
    } else if (req['symfony/framework-bundle'] || req['symfony/symfony']) {
      context.backendFramework = 'symfony';
      context.architecturePattern = 'MVC (Symfony)';
      context.commands.dev_server = 'symfony server:start';
      context.databases.push({ type: 'relational', orm: 'doctrine' });
    } else {
      context.backendFramework = 'custom-php';
    }

    // Testing in PHP
    if (req['pestphp/pest']) {
      context.testFramework = 'pest';
      context.commands.test = 'vendor/bin/pest';
    } else if (req['phpunit/phpunit']) {
      context.testFramework = 'phpunit';
      context.commands.test = context.backendFramework === 'laravel' ? 'php artisan test' : 'vendor/bin/phpunit';
    }

    context.commands.install = context.commands.install ? context.commands.install + ' && composer install' : 'composer install';
  }

  // 2. Detect Package.json (Node.js / React / Next.js / Vue / Angular / TypeScript)
  const pkgJsonPath = path.join(projectRoot, 'package.json');
  const pkg = safeReadJson(pkgJsonPath);
  if (pkg) {
    if (!composer && pkg.name) context.projectName = pkg.name;
    if (!context.description && pkg.description) context.description = pkg.description;
    if (pkg.version) context.version = pkg.version;

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const hasTs = Boolean(allDeps['typescript'] || fs.existsSync(path.join(projectRoot, 'tsconfig.json')));

    // Framework detection
    if (allDeps['next']) {
      context.frontendFramework = 'next';
      context.frontendLanguage = hasTs ? 'typescript' : 'javascript';
      if (!context.backendFramework) {
        context.backendFramework = 'nextjs-api';
        context.backendLanguage = hasTs ? 'typescript' : 'javascript';
      }
      context.architecturePattern = dirExists(path.join(projectRoot, 'src', 'app')) || dirExists(path.join(projectRoot, 'app'))
        ? 'Next.js App Router'
        : 'Next.js Pages Router';
    } else if (allDeps['react']) {
      context.frontendFramework = 'react';
      context.frontendLanguage = hasTs ? 'typescript' : 'javascript';
    } else if (allDeps['vue']) {
      context.frontendFramework = 'vue';
      context.frontendLanguage = hasTs ? 'typescript' : 'javascript';
    } else if (allDeps['@angular/core']) {
      context.frontendFramework = 'angular';
      context.frontendLanguage = 'typescript';
    }

    // Backend Node detection if not PHP
    if (!context.backendFramework) {
      if (allDeps['@nestjs/core']) {
        context.backendFramework = 'nestjs';
        context.backendLanguage = 'typescript';
        context.architecturePattern = 'Modular / Dependency Injection (NestJS)';
      } else if (allDeps['express']) {
        context.backendFramework = 'express';
        context.backendLanguage = hasTs ? 'typescript' : 'javascript';
      } else if (allDeps['fastify']) {
        context.backendFramework = 'fastify';
        context.backendLanguage = hasTs ? 'typescript' : 'javascript';
      } else if (allDeps['koa']) {
        context.backendFramework = 'koa';
        context.backendLanguage = hasTs ? 'typescript' : 'javascript';
      }
    }

    // Styling
    if (allDeps['tailwindcss'] || fs.existsSync(path.join(projectRoot, 'tailwind.config.js')) || fs.existsSync(path.join(projectRoot, 'tailwind.config.ts'))) {
      context.styling = 'tailwind';
    } else if (allDeps['styled-components']) {
      context.styling = 'styled-components';
    } else if (allDeps['@mui/material'] || allDeps['@material-ui/core']) {
      context.styling = 'material-ui';
    }

    // Database / ORM in Node
    if (allDeps['prisma'] || allDeps['@prisma/client']) {
      context.databases.push({ type: 'relational / mongodb', orm: 'prisma' });
      if (!context.commands.migrate) context.commands.migrate = 'npx prisma migrate dev';
    }
    if (allDeps['typeorm']) {
      context.databases.push({ type: 'relational', orm: 'typeorm' });
    }
    if (allDeps['drizzle-orm']) {
      context.databases.push({ type: 'relational', orm: 'drizzle' });
    }
    if (allDeps['mongoose']) {
      context.databases.push({ type: 'mongodb', orm: 'mongoose' });
    }

    // Testing framework
    if (allDeps['vitest']) {
      context.testFramework = context.testFramework || 'vitest';
      context.commands.test = context.commands.test || 'npx vitest run';
    } else if (allDeps['jest']) {
      context.testFramework = context.testFramework || 'jest';
      context.commands.test = context.commands.test || 'npm test';
    }

    // Scripts extraction
    const scripts = pkg.scripts || {};
    if (scripts.dev) context.commands.dev_server = context.commands.dev_server || 'npm run dev';
    else if (scripts.start) context.commands.dev_server = context.commands.dev_server || 'npm start';

    if (scripts.build) context.commands.build = 'npm run build';
    if (scripts.test) context.commands.test = context.commands.test || 'npm test';
    if (scripts.lint) context.commands.lint = 'npm run lint';

    context.commands.install = context.commands.install ? context.commands.install + ' && npm install' : 'npm install';
  }

  // 3. Detect Python (Django / FastAPI / Flask)
  const pyproject = safeReadFile(path.join(projectRoot, 'pyproject.toml'));
  const reqTxt = safeReadFile(path.join(projectRoot, 'requirements.txt'));
  const pyContent = pyproject + '\n' + reqTxt;
  if (pyContent.trim()) {
    if (!context.backendLanguage) {
      context.backendLanguage = 'python';
      if (/fastapi/i.test(pyContent)) {
        context.backendFramework = 'fastapi';
        context.commands.dev_server = 'uvicorn main:app --reload';
      } else if (/django/i.test(pyContent)) {
        context.backendFramework = 'django';
        context.architecturePattern = 'MVT (Django)';
        context.commands.dev_server = 'python manage.py runserver';
        context.commands.migrate = 'python manage.py migrate';
        context.databases.push({ type: 'relational', orm: 'django-orm' });
      } else if (/flask/i.test(pyContent)) {
        context.backendFramework = 'flask';
        context.commands.dev_server = 'flask run';
      }

      if (/pytest/i.test(pyContent) || fs.existsSync(path.join(projectRoot, 'pytest.ini'))) {
        context.testFramework = 'pytest';
        context.commands.test = 'pytest';
      }
      context.commands.install = context.commands.install || 'pip install -r requirements.txt';
    }
  }

  // 4. Inspect Directory Structure for Layers & Key Dirs
  const candidateDirs = [
    { path: 'app/Http/Controllers', layer: 'Controllers (HTTP Layer)' },
    { path: 'app/Services', layer: 'Services (Business Logic)' },
    { path: 'app/Models', layer: 'Models (Data Access)' },
    { path: 'database/migrations', layer: 'Database Migrations' },
    { path: 'routes', layer: 'Routing' },
    { path: 'src/app', layer: 'Next.js App Router Pages & APIs' },
    { path: 'src/components', layer: 'UI Components' },
    { path: 'src/services', layer: 'Frontend / API Services' },
    { path: 'src/hooks', layer: 'Custom React Hooks' },
    { path: 'src/controllers', layer: 'Controllers' },
    { path: 'src/models', layer: 'Data Models' },
    { path: 'tests', layer: 'Automated Tests' },
    { path: '__tests__', layer: 'Automated Tests' },
  ];

  for (const c of candidateDirs) {
    if (dirExists(path.join(projectRoot, c.path))) {
      context.layers.push({ name: c.layer, path: c.path });
      context.keyDirectories.push({ path: c.path, purpose: c.layer });
    }
  }

  // Fallback defaults if empty
  if (!context.commands.test) {
    context.commands.test = 'echo "No test runner configured"';
  }
  if (!context.commands.install) {
    context.commands.install = 'echo "No package manager detected"';
  }

  return context;
}

/**
 * Generate formatted Markdown for .agents/project-context.md
 */
function renderProjectContextMarkdown(ctx) {
  const dbLines = ctx.databases.length > 0
    ? ctx.databases.map(d => `  - type: "${d.type}"\n    orm: "${d.orm}"`).join('\n')
    : `  - type: "unknown"\n    orm: "unknown"`;

  const layerLines = ctx.layers.length > 0
    ? ctx.layers.map(l => `  - name: "${l.name}"\n    path: "${l.path}"`).join('\n')
    : `  - name: "Core"\n    path: "src/"`;

  const keyDirLines = ctx.keyDirectories.length > 0
    ? ctx.keyDirectories.map(k => `  - path: "${k.path}"\n    purpose: "${k.purpose}"`).join('\n')
    : `  - path: "src/"\n    purpose: "Source files"`;

  return `# Project Context

> **Instructions for the AI agent:** Read this file first when starting any task in this project.
> Do NOT overwrite this file without user permission.
> Generated automatically by \`ai-dev-starter init\`.

---

## Project Identity

\`\`\`yaml
project_name: "${ctx.projectName}"
version: "${ctx.version}"
description: "${ctx.description || 'Application codebase'}"
repository: "${ctx.repository || 'local'}"
\`\`\`

---

## Tech Stack

\`\`\`yaml
# Backend
backend_language: "${ctx.backendLanguage || 'not-specified'}"
backend_framework: "${ctx.backendFramework || 'not-specified'}"
backend_version: "${ctx.backendVersion || ''}"

# Frontend
frontend_framework: "${ctx.frontendFramework}"
frontend_language: "${ctx.frontendLanguage || 'not-specified'}"
styling: "${ctx.styling || 'not-specified'}"

# Database
databases:
${dbLines}

# Infrastructure
hosting: "unknown"
containerized: ${fs.existsSync(path.join(ctx.projectRoot || '', 'Dockerfile')) || fs.existsSync(path.join(ctx.projectRoot || '', 'docker-compose.yml'))}
ci_cd: "${dirExists(path.join(ctx.projectRoot || '', '.github', 'workflows')) ? 'GitHub Actions' : 'none'}"
\`\`\`

---

## Architecture

\`\`\`yaml
pattern: "${ctx.architecturePattern}"
layers:
${layerLines}

key_directories:
${keyDirLines}
\`\`\`

---

## Development Commands

\`\`\`yaml
install: "${ctx.commands.install}"
dev_server: "${ctx.commands.dev_server}"
build: "${ctx.commands.build}"
test: "${ctx.commands.test}"
lint: "${ctx.commands.lint}"
migrate: "${ctx.commands.migrate}"
\`\`\`

---

## Testing Setup

\`\`\`yaml
backend_test_framework: "${ctx.testFramework || 'unknown'}"
test_directory: "${ctx.testDirectory}"
integration_tests: false
e2e_tests: false
coverage_target: 80
\`\`\`

---

## Review and Report Settings

\`\`\`yaml
report_language: "${ctx.reportLanguage}"       # fa = Persian (Farsi), en = English
severity_threshold: "${ctx.severityThreshold}"    # Minimum severity to include in reports (P0, P1, P2, P3)
auto_review_on_change: ${ctx.autoReview ? 'true' : 'false'} # If true, AI automatically runs PR-Agent review after every code edit prompt
\`\`\`

---

## Important Constraints

\`\`\`yaml
# Safety constraints enforced across all AI workflows
never_do:
  - "Never commit or push directly to git"
  - "Never run destructive migrations in production"
  - "Never expose environment credentials or secrets"
  - "Never make edits outside the user-requested scope"
\`\`\`

---

## Project Notes

<!-- Add any additional context the AI should know about this project. -->
`;
}

module.exports = {
  detectProjectContext,
  renderProjectContextMarkdown,
};
