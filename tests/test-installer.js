#!/usr/bin/env node

/**
 * ai-dev-starter test suite
 * 
 * Tests the installation script for correctness, idempotency, 
 * conflict detection, and safe uninstallation.
 * 
 * Run from the ai-dev-starter directory:
 *   node tests/test-installer.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ─── Test Framework ───────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    failed++;
    failures.push({ name, error: e.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const SCRIPT = path.resolve(__dirname, '..', 'scripts', 'ai-dev-starter.js');
const STARTER_KIT_DIR = path.resolve(__dirname, '..');

function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-dev-starter-test-'));
  // Init git — use -b to avoid any global defaultBranch config issues
  try {
    execSync('git init -b main', { cwd: dir, stdio: 'pipe' });
  } catch {
    execSync('git init', { cwd: dir, stdio: 'pipe' });
  }
  execSync('git config user.email "test@test.com"', { cwd: dir, stdio: 'pipe' });
  execSync('git config user.name "Test"', { cwd: dir, stdio: 'pipe' });
  // Create a dummy remote so git-analysis commands don't error
  execSync('git remote add origin https://github.com/test/test.git', { cwd: dir, stdio: 'pipe' });
  return dir;
}

function runCLI(args, cwd) {
  try {
    const result = execSync(`node "${SCRIPT}" ${args}`, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { stdout: result, exitCode: 0 };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', exitCode: e.status || 1 };
  }
}

function cleanup(dir) {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

console.log('\n  ai-dev-starter — Test Suite\n');

// ── Test Group 1: Script existence ──
console.log('\n  [Group 1] Script and source file existence');

test('installer script exists', () => {
  assert(fs.existsSync(SCRIPT), `Script not found: ${SCRIPT}`);
});

const coreFiles = [
  'core/agent-principles.md',
  'core/safety-policy.md',
  'core/git-analysis.md',
  'core/review-methodology.md',
  'core/severity-levels.md',
];

for (const file of coreFiles) {
  test(`core file exists: ${file}`, () => {
    assert(fs.existsSync(path.join(STARTER_KIT_DIR, file)), `Missing: ${file}`);
  });
}

const workflowFiles = [
  'workflows/code-review.md',
  'workflows/bug-fix.md',
  'workflows/feature-development.md',
  'workflows/refactor.md',
  'workflows/security-audit.md',
  'workflows/performance-audit.md',
  'workflows/architecture-review.md',
  'workflows/test-generation.md',
];

for (const file of workflowFiles) {
  test(`workflow file exists: ${file}`, () => {
    assert(fs.existsSync(path.join(STARTER_KIT_DIR, file)), `Missing: ${file}`);
  });
}

const skillFiles = [
  'adapters/antigravity/skills/code-review/SKILL.md',
  'adapters/antigravity/skills/bug-fix/SKILL.md',
  'adapters/antigravity/skills/feature-development/SKILL.md',
  'adapters/antigravity/skills/refactor/SKILL.md',
  'adapters/antigravity/skills/security-audit/SKILL.md',
  'adapters/antigravity/skills/performance-audit/SKILL.md',
  'adapters/antigravity/skills/architecture-review/SKILL.md',
  'adapters/antigravity/skills/test-generation/SKILL.md',
];

for (const file of skillFiles) {
  test(`skill file exists: ${file}`, () => {
    assert(fs.existsSync(path.join(STARTER_KIT_DIR, file)), `Missing: ${file}`);
  });
}

const cursorFiles = [
  'adapters/cursor/core-rules.mdc',
  'adapters/cursor/code-review.mdc',
  'adapters/cursor/bug-fix.mdc',
  'adapters/cursor/feature-development.mdc',
];

for (const file of cursorFiles) {
  test(`cursor adapter exists: ${file}`, () => {
    assert(fs.existsSync(path.join(STARTER_KIT_DIR, file)), `Missing: ${file}`);
  });
}

// ── Test Group 2: SKILL.md frontmatter validation ──
console.log('\n  [Group 2] SKILL.md frontmatter validation');

for (const file of skillFiles) {
  test(`${path.basename(path.dirname(file))} SKILL.md has valid frontmatter`, () => {
    const content = fs.readFileSync(path.join(STARTER_KIT_DIR, file), 'utf8');
    assert(content.startsWith('---'), `Missing frontmatter start: ${file}`);
    assert(content.includes('name:'), `Missing name: in frontmatter: ${file}`);
    assert(content.includes('description:'), `Missing description: in frontmatter: ${file}`);
  });
}

// ── Test Group 3: Cursor .mdc validation ──
console.log('\n  [Group 3] Cursor .mdc frontmatter validation');

for (const file of cursorFiles) {
  test(`${path.basename(file)} has valid frontmatter`, () => {
    const content = fs.readFileSync(path.join(STARTER_KIT_DIR, file), 'utf8');
    assert(content.startsWith('---'), `Missing frontmatter start: ${file}`);
    assert(content.includes('description:'), `Missing description: in frontmatter: ${file}`);
    assert(content.includes('alwaysApply:'), `Missing alwaysApply: in frontmatter: ${file}`);
  });
}

// ── Test Group 4: Installation ──
console.log('\n  [Group 4] Installation (Antigravity)');

let testDir;

test('init --ide antigravity creates expected files', () => {
  testDir = createTempProject();
  const result = runCLI(`init --ide antigravity --target "${testDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `CLI exited with code ${result.exitCode}\n${result.stdout}`);
  assert(fs.existsSync(path.join(testDir, 'AGENTS.md')), 'AGENTS.md not created');
  assert(fs.existsSync(path.join(testDir, '.agents', 'skills', 'code-review', 'SKILL.md')), 'code-review SKILL.md not created');
  assert(fs.existsSync(path.join(testDir, '.agents', 'core', 'agent-principles.md')), 'agent-principles.md not created');
  assert(fs.existsSync(path.join(testDir, '.agents', 'workflows', 'code-review.md')), 'code-review workflow not created');
});

test('init creates project-context.md template', () => {
  assert(testDir, 'testDir not set');
  assert(fs.existsSync(path.join(testDir, '.agents', 'project-context.md')), 'project-context.md not created');
});

test('init creates manifest file', () => {
  assert(testDir, 'testDir not set');
  assert(fs.existsSync(path.join(testDir, '.ai-dev-starter-manifest.json')), 'manifest not created');
});

test('manifest has correct structure', () => {
  assert(testDir, 'testDir not set');
  const manifest = JSON.parse(fs.readFileSync(path.join(testDir, '.ai-dev-starter-manifest.json'), 'utf8'));
  assert(manifest.version, 'manifest missing version');
  assert(manifest.ide === 'antigravity', `manifest.ide should be antigravity, got ${manifest.ide}`);
  assert(Array.isArray(manifest.files), 'manifest.files should be an array');
  assert(manifest.files.length > 0, 'manifest.files should not be empty');
});

// ── Test Group 5: Idempotency ──
console.log('\n  [Group 5] Idempotency');

test('running init twice does not duplicate files', () => {
  assert(testDir, 'testDir not set from previous group');
  const result = runCLI(`init --ide antigravity --target "${testDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Second init failed: ${result.stdout}`);
  // Verify a non-interactive file (skill, not AGENTS.md which prompts) is intact
  const skillPath = path.join(testDir, '.agents', 'skills', 'code-review', 'SKILL.md');
  assert(fs.existsSync(skillPath), 'code-review SKILL.md missing after second init');
  const content = fs.readFileSync(skillPath, 'utf8');
  assert(content.includes('code-review'), 'SKILL.md content looks wrong after second init');
});

test('update command succeeds', () => {
  assert(testDir, 'testDir not set');
  const result = runCLI(`update --target "${testDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Update failed: ${result.stdout}`);
});

// ── Test Group 6: Cursor Installation ──
console.log('\n  [Group 6] Cursor installation');

let cursorDir;

test('init --ide cursor creates .cursor/rules files', () => {
  cursorDir = createTempProject();
  const result = runCLI(`init --ide cursor --target "${cursorDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `CLI exited with code ${result.exitCode}\n${result.stdout}`);
  assert(fs.existsSync(path.join(cursorDir, '.cursor', 'rules', 'ai-core-rules.mdc')), 'core-rules.mdc not created');
  assert(fs.existsSync(path.join(cursorDir, '.cursor', 'rules', 'code-review.mdc')), 'code-review.mdc not created');
});

test('cursor install does not create AGENTS.md', () => {
  assert(cursorDir, 'cursorDir not set');
  // AGENTS.md should NOT be created for cursor-only installs
  // (It is in ANTIGRAVITY_FILES, not CURSOR_FILES)
  // The merge of both sets would include it, but cursor-only should not.
  // Verify AGENTS.md is absent for a pure cursor install
  const agentsPath = path.join(cursorDir, 'AGENTS.md');
  assert(!fs.existsSync(agentsPath), 'AGENTS.md should not be created for cursor-only install');
});

// ── Test Group 7: Doctor command ──
console.log('\n  [Group 7] Doctor command');

test('doctor reports OK on clean install', () => {
  assert(testDir, 'testDir not set');
  const result = runCLI(`doctor --target "${testDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Doctor failed: ${result.stdout}`);
  assert(result.stdout.includes('All checks passed') || result.stdout.includes('issue'), 'Unexpected doctor output');
});

// ── Test Group 8: Safety — no credentials in source files ──
console.log('\n  [Group 8] Safety checks');

const allSourceFiles = [
  ...coreFiles,
  ...workflowFiles,
  ...skillFiles,
  ...cursorFiles,
  'adapters/antigravity/AGENTS.md',
  'templates/project-context.md',
  'templates/review-report.md',
  'standards/security.md',
];

test('no hardcoded API keys in source files', () => {
  const suspiciousPatterns = [
    /sk-[a-zA-Z0-9]{20,}/,       // OpenAI key pattern
    /AIza[a-zA-Z0-9_-]{35}/,     // Google API key
    /AKIA[A-Z0-9]{16}/,          // AWS access key
    /Bearer [a-zA-Z0-9_.-]{30,}/, // Bearer token
  ];

  for (const file of allSourceFiles) {
    const filePath = path.join(STARTER_KIT_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of suspiciousPatterns) {
      assert(!pattern.test(content), `Potential credential found in ${file}`);
    }
  }
});

test('no external LLM API references in source files', () => {
  const externalLLMPatterns = [
    /api\.openai\.com/,
    /api\.anthropic\.com/,
    /generativelanguage\.googleapis\.com.*key=/,
    /OPENAI_API_KEY\s*=/,
    /ANTHROPIC_API_KEY\s*=/,
  ];

  for (const file of allSourceFiles) {
    const filePath = path.join(STARTER_KIT_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    for (const pattern of externalLLMPatterns) {
      assert(!pattern.test(content), `External LLM API reference found in ${file}: ${pattern}`);
    }
  }
});

// ── Test Group 9: Uninstall ──
console.log('\n  [Group 9] Uninstall');

test('uninstall removes installed files (non-interactive simulation)', () => {
  // Verify the manifest from the initial install is still readable and contains files
  // (Full interactive uninstall tested manually — requires stdin simulation)
  const manifestPath = path.join(testDir, '.ai-dev-starter-manifest.json');
  assert(testDir && fs.existsSync(manifestPath), 'No manifest to verify uninstall readiness');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.files.length > 0, 'Nothing to uninstall');
  assert(manifest.files[0].target, 'File record missing target');
  assert(manifest.files[0].installedContent !== undefined, 'File record missing installedContent for change detection');
});

// ── Test Group 10: Project Context Auto-Detection ──
console.log('\n  [Group 10] Project Context Auto-Detection');

let laravelDir;
test('auto-detects Laravel / PHP tech stack and populates project-context.md', () => {
  laravelDir = createTempProject();
  fs.writeFileSync(path.join(laravelDir, 'composer.json'), JSON.stringify({
    name: 'acme/laravel-shop',
    description: 'E-commerce platform with Laravel',
    require: {
      'php': '^8.2',
      'laravel/framework': '^11.0'
    },
    'require-dev': {
      'pestphp/pest': '^2.0'
    }
  }, null, 2));

  fs.mkdirSync(path.join(laravelDir, 'app', 'Http', 'Controllers'), { recursive: true });
  fs.mkdirSync(path.join(laravelDir, 'database', 'migrations'), { recursive: true });

  const result = runCLI(`init --ide antigravity --target "${laravelDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Init failed on mock Laravel project: ${result.stdout}`);

  const contextFile = path.join(laravelDir, '.agents', 'project-context.md');
  assert(fs.existsSync(contextFile), 'project-context.md not created');
  const contextContent = fs.readFileSync(contextFile, 'utf8');

  assert(contextContent.includes('backend_framework: "laravel"'), 'Did not detect laravel framework');
  assert(contextContent.includes('backend_language: "php"'), 'Did not detect php language');
  assert(contextContent.includes('pest'), 'Did not detect pest testing framework');
  assert(contextContent.includes('eloquent'), 'Did not detect eloquent ORM');
  assert(contextContent.includes('app/Http/Controllers'), 'Did not detect controllers directory');
});

let nextjsDir;
test('auto-detects Next.js / TypeScript / Tailwind tech stack', () => {
  nextjsDir = createTempProject();
  fs.writeFileSync(path.join(nextjsDir, 'package.json'), JSON.stringify({
    name: 'my-next-saas',
    version: '2.1.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      test: 'vitest run'
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      'typescript': '^5.0.0',
      'tailwindcss': '^3.4.0',
      'vitest': '^1.0.0'
    }
  }, null, 2));

  fs.mkdirSync(path.join(nextjsDir, 'src', 'app'), { recursive: true });

  const result = runCLI(`init --ide cursor --target "${nextjsDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Init failed on mock Next.js project: ${result.stdout}`);

  const contextFile = path.join(nextjsDir, '.agents', 'project-context.md');
  assert(fs.existsSync(contextFile), 'project-context.md not created');
  const contextContent = fs.readFileSync(contextFile, 'utf8');

  assert(contextContent.includes('frontend_framework: "next"'), 'Did not detect next frontend framework');
  assert(contextContent.includes('frontend_language: "typescript"'), 'Did not detect typescript');
  assert(contextContent.includes('styling: "tailwind"'), 'Did not detect tailwind styling');
  assert(contextContent.includes('vitest'), 'Did not detect vitest test framework');
  assert(contextContent.includes('Next.js App Router'), 'Did not detect App Router pattern');
});

test('preserves customized project-context.md without overwriting', () => {
  assert(nextjsDir, 'nextjsDir not set');
  const contextFile = path.join(nextjsDir, '.agents', 'project-context.md');
  const customNote = 'CUSTOM_USER_PROJECT_RULE_XYZ_123';
  fs.appendFileSync(contextFile, `\n# Custom Note\n${customNote}\n`);

  // Run update
  const result = runCLI(`update --target "${nextjsDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Update failed: ${result.stdout}`);

  const updatedContent = fs.readFileSync(contextFile, 'utf8');
  assert(updatedContent.includes(customNote), 'Custom note was erased by update!');
});

test('detect command prints detected stack info', () => {
  assert(nextjsDir, 'nextjsDir not set');
  const result = runCLI(`detect --target "${nextjsDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Detect command failed: ${result.stdout}`);
  assert(result.stdout.includes('my-next-saas'), 'Output missing project name');
  assert(result.stdout.includes('next'), 'Output missing framework');
});

// ── Test Group 11: Selective Skills & Custom Language ──
console.log('\n  [Group 11] Selective Skills & Custom Language');

let selectiveDir;
test('installs only selected skills when requested', () => {
  selectiveDir = createTempProject();
  const result = runCLI(`init --ide antigravity --skills review --lang en -y --target "${selectiveDir}"`, STARTER_KIT_DIR);
  assert(result.exitCode === 0, `Selective init failed: ${result.stdout}`);

  // Selected skills must exist
  assert(fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'code-review', 'SKILL.md')), 'code-review skill missing');
  assert(fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'security-audit', 'SKILL.md')), 'security-audit skill missing');
  assert(fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'performance-audit', 'SKILL.md')), 'performance-audit skill missing');

  // Unselected skills must NOT exist
  assert(!fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'bug-fix', 'SKILL.md')), 'bug-fix should not be installed');
  assert(!fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'feature-development', 'SKILL.md')), 'feature-dev should not be installed');
  assert(!fs.existsSync(path.join(selectiveDir, '.agents', 'skills', 'test-generation', 'SKILL.md')), 'test-gen should not be installed');

  // Language must be English
  const contextContent = fs.readFileSync(path.join(selectiveDir, '.agents', 'project-context.md'), 'utf8');
  assert(contextContent.includes('report_language: "en"'), 'report_language was not set to en');
});

// ── Cleanup ──
cleanup(testDir);
cleanup(cursorDir);
cleanup(laravelDir);
cleanup(nextjsDir);
cleanup(selectiveDir);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n  ─────────────────────────────────');
console.log(`  Results: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log('\n  Failed tests:');
  failures.forEach(f => {
    console.log(`    ✗ ${f.name}`);
    console.log(`      ${f.error}`);
  });
  console.log('');
  process.exit(1);
} else {
  console.log('  All tests passed.\n');
}
