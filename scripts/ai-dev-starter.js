#!/usr/bin/env node

/**
 * ai-dev-starter CLI
 * 
 * Interactive graphical installation and management tool for the Universal AI Development Starter Kit.
 * Compatible with Google Antigravity, Cursor, and modern AI coding IDEs.
 * 
 * Usage:
 *   npx ai-dev-starter [init] [--ide antigravity|cursor|both] [--skills all|review|dev|<comma-separated>] [--lang fa|en] [--merge] [-y] [--target <path>]
 *   npx ai-dev-starter update [--target <path>]
 *   npx ai-dev-starter doctor [--target <path>]
 *   npx ai-dev-starter detect [--target <path>]
 *   npx ai-dev-starter uninstall [--target <path>]
 * 
 * Zero external runtime dependencies. Runs instantly with standard Node.js.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { detectProjectContext, renderProjectContextMarkdown } = require('./detector');

// ─── Constants ────────────────────────────────────────────────────────────────

const STARTER_KIT_DIR = path.resolve(__dirname, '..');
const MANIFEST_FILE = '.ai-dev-starter-manifest.json';
const MANIFEST_VERSION = '1.0.0';

const ALL_SKILLS = [
  'code-review',
  'bug-fix',
  'feature-development',
  'refactor',
  'security-audit',
  'performance-audit',
  'architecture-review',
  'test-generation',
];

// ─── Graphical UI & Styling ───────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
  bgMagenta: '\x1b[45m',
  bgGray: '\x1b[100m',
};

function color(name, text) {
  return (C[name] || '') + text + C.reset;
}

function log(msg = '') { console.log(msg); }
function ok(msg)       { console.log(`  ${color('green', '✔')} ${msg}`); }
function warn(msg)     { console.log(`  ${color('yellow', '▲')} ${color('yellow', msg)}`); }
function err(msg)      { console.log(`  ${color('red', '✖')} ${color('red', msg)}`); }
function info(msg)     { console.log(`  ${color('cyan', '◆')} ${msg}`); }
function sub(msg)      { console.log(`    ${color('gray', '↳')} ${color('dim', msg)}`); }

function badge(text, bgCol = 'bgCyan', fgCol = 'black') {
  return `${C[bgCol]}${C[fgCol]}${C.bold} ${text} ${C.reset}`;
}

function printBanner() {
  log('');
  log(color('cyan', '  ╭──────────────────────────────────────────────────────────────╮'));
  log(color('cyan', '  │') + `  ${color('bold', color('white', '⚡  AI DEV STARTER'))}  ${color('dim', 'v' + MANIFEST_VERSION)}                                  ` + color('cyan', '│'));
  log(color('cyan', '  │') + `  ${color('gray', 'Universal AI Development Kit for Antigravity & Cursor')}        ` + color('cyan', '│'));
  log(color('cyan', '  ╰──────────────────────────────────────────────────────────────╯'));
  log('');
}

function printCard(title, items) {
  const line = '─'.repeat(58);
  log(color('gray', `  ┌─ ${color('bold', color('white', title))} ${line.slice(title.length + 4)}`));
  for (const [k, v] of Object.entries(items)) {
    const pad = ' '.repeat(Math.max(1, 14 - k.length));
    log(color('gray', '  │  ') + color('cyan', k) + pad + color('white', v));
  }
  log(color('gray', `  └${line}`));
  log('');
}

function printStepHeader(current, total, title) {
  log('');
  log(`  ${color('magenta', '◆')} ${color('bold', `Step ${current} of ${total}:`)} ${color('bold', color('white', title))}`);
  log(color('gray', '  ──────────────────────────────────────────────────────────'));
}

function ask(question, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    const promptText = `  ${color('cyan', '?')} ${color('bold', question)}${defaultValue ? color('dim', ` (${defaultValue})`) : ''}: `;
    rl.question(promptText, answer => {
      rl.close();
      const val = answer.trim();
      resolve(val ? val.toLowerCase() : defaultValue.toLowerCase());
    });
  });
}

// ─── File Installation Manifests ──────────────────────────────────────────────

const ANTIGRAVITY_FILES = [
  // Core files (always required)
  { source: 'core/agent-principles.md',   target: '.agents/core/agent-principles.md',   category: 'Core' },
  { source: 'core/safety-policy.md',      target: '.agents/core/safety-policy.md',      category: 'Core' },
  { source: 'core/git-analysis.md',       target: '.agents/core/git-analysis.md',       category: 'Core' },
  { source: 'core/review-methodology.md', target: '.agents/core/review-methodology.md', category: 'Core' },
  { source: 'core/severity-levels.md',    target: '.agents/core/severity-levels.md',    category: 'Core' },

  // Workflow files
  { source: 'workflows/code-review.md',        target: '.agents/workflows/code-review.md',        skill: 'code-review',        category: 'Workflow' },
  { source: 'workflows/bug-fix.md',             target: '.agents/workflows/bug-fix.md',             skill: 'bug-fix',             category: 'Workflow' },
  { source: 'workflows/feature-development.md', target: '.agents/workflows/feature-development.md', skill: 'feature-development', category: 'Workflow' },
  { source: 'workflows/refactor.md',            target: '.agents/workflows/refactor.md',            skill: 'refactor',            category: 'Workflow' },
  { source: 'workflows/security-audit.md',      target: '.agents/workflows/security-audit.md',      skill: 'security-audit',      category: 'Workflow' },
  { source: 'workflows/performance-audit.md',   target: '.agents/workflows/performance-audit.md',   skill: 'performance-audit',   category: 'Workflow' },
  { source: 'workflows/architecture-review.md', target: '.agents/workflows/architecture-review.md', skill: 'architecture-review', category: 'Workflow' },
  { source: 'workflows/test-generation.md',     target: '.agents/workflows/test-generation.md',     skill: 'test-generation',     category: 'Workflow' },

  // Standards files
  { source: 'standards/backend.md',   target: '.agents/standards/backend.md',   category: 'Standard' },
  { source: 'standards/frontend.md',  target: '.agents/standards/frontend.md',  category: 'Standard' },
  { source: 'standards/database.md',  target: '.agents/standards/database.md',  category: 'Standard' },
  { source: 'standards/security.md',  target: '.agents/standards/security.md',  category: 'Standard' },
  { source: 'standards/testing.md',   target: '.agents/standards/testing.md',   category: 'Standard' },

  // Templates
  { source: 'templates/review-report.md',         target: '.agents/templates/review-report.md',         category: 'Template' },
  { source: 'templates/architecture-decision.md', target: '.agents/templates/architecture-decision.md', category: 'Template' },

  // Antigravity adapter
  { source: 'adapters/antigravity/AGENTS.md',   target: 'AGENTS.md', userModifiable: true, category: 'Adapter' },

  // Skills
  { source: 'adapters/antigravity/skills/code-review/SKILL.md',        target: '.agents/skills/code-review/SKILL.md',        skill: 'code-review',        category: 'Skill' },
  { source: 'adapters/antigravity/skills/bug-fix/SKILL.md',             target: '.agents/skills/bug-fix/SKILL.md',             skill: 'bug-fix',             category: 'Skill' },
  { source: 'adapters/antigravity/skills/feature-development/SKILL.md', target: '.agents/skills/feature-development/SKILL.md', skill: 'feature-development', category: 'Skill' },
  { source: 'adapters/antigravity/skills/refactor/SKILL.md',            target: '.agents/skills/refactor/SKILL.md',            skill: 'refactor',            category: 'Skill' },
  { source: 'adapters/antigravity/skills/security-audit/SKILL.md',      target: '.agents/skills/security-audit/SKILL.md',      skill: 'security-audit',      category: 'Skill' },
  { source: 'adapters/antigravity/skills/performance-audit/SKILL.md',   target: '.agents/skills/performance-audit/SKILL.md',   skill: 'performance-audit',   category: 'Skill' },
  { source: 'adapters/antigravity/skills/architecture-review/SKILL.md', target: '.agents/skills/architecture-review/SKILL.md', skill: 'architecture-review', category: 'Skill' },
  { source: 'adapters/antigravity/skills/test-generation/SKILL.md',     target: '.agents/skills/test-generation/SKILL.md',     skill: 'test-generation',     category: 'Skill' },
];

const CURSOR_FILES = [
  // Core files
  { source: 'core/agent-principles.md',   target: '.agents/core/agent-principles.md',   category: 'Core' },
  { source: 'core/safety-policy.md',      target: '.agents/core/safety-policy.md',      category: 'Core' },
  { source: 'core/git-analysis.md',       target: '.agents/core/git-analysis.md',       category: 'Core' },
  { source: 'core/review-methodology.md', target: '.agents/core/review-methodology.md', category: 'Core' },
  { source: 'core/severity-levels.md',    target: '.agents/core/severity-levels.md',    category: 'Core' },

  // Workflows
  { source: 'workflows/code-review.md',        target: '.agents/workflows/code-review.md',        skill: 'code-review',        category: 'Workflow' },
  { source: 'workflows/bug-fix.md',             target: '.agents/workflows/bug-fix.md',             skill: 'bug-fix',             category: 'Workflow' },
  { source: 'workflows/feature-development.md', target: '.agents/workflows/feature-development.md', skill: 'feature-development', category: 'Workflow' },
  { source: 'workflows/refactor.md',            target: '.agents/workflows/refactor.md',            skill: 'refactor',            category: 'Workflow' },
  { source: 'workflows/security-audit.md',      target: '.agents/workflows/security-audit.md',      skill: 'security-audit',      category: 'Workflow' },
  { source: 'workflows/performance-audit.md',   target: '.agents/workflows/performance-audit.md',   skill: 'performance-audit',   category: 'Workflow' },
  { source: 'workflows/architecture-review.md', target: '.agents/workflows/architecture-review.md', skill: 'architecture-review', category: 'Workflow' },
  { source: 'workflows/test-generation.md',     target: '.agents/workflows/test-generation.md',     skill: 'test-generation',     category: 'Workflow' },

  // Standards
  { source: 'standards/backend.md',   target: '.agents/standards/backend.md',   category: 'Standard' },
  { source: 'standards/frontend.md',  target: '.agents/standards/frontend.md',  category: 'Standard' },
  { source: 'standards/database.md',  target: '.agents/standards/database.md',  category: 'Standard' },
  { source: 'standards/security.md',  target: '.agents/standards/security.md',  category: 'Standard' },
  { source: 'standards/testing.md',   target: '.agents/standards/testing.md',   category: 'Standard' },

  // Templates
  { source: 'templates/review-report.md',         target: '.agents/templates/review-report.md',         category: 'Template' },
  { source: 'templates/architecture-decision.md', target: '.agents/templates/architecture-decision.md', category: 'Template' },

  // Cursor rules
  { source: 'adapters/cursor/core-rules.mdc',              target: '.cursor/rules/ai-core-rules.mdc',              category: 'Rule' },
  { source: 'adapters/cursor/code-review.mdc',             target: '.cursor/rules/code-review.mdc',             skill: 'code-review',        category: 'Rule' },
  { source: 'adapters/cursor/bug-fix.mdc',                 target: '.cursor/rules/bug-fix.mdc',                 skill: 'bug-fix',             category: 'Rule' },
  { source: 'adapters/cursor/feature-development.mdc',     target: '.cursor/rules/feature-development.mdc',     skill: 'feature-development', category: 'Rule' },
  { source: 'adapters/cursor/refactor-and-security.mdc',   target: '.cursor/rules/refactor-and-security.mdc',   skills: ['refactor', 'security-audit'], category: 'Rule' },
  { source: 'adapters/cursor/performance-arch-tests.mdc',  target: '.cursor/rules/performance-arch-tests.mdc',  skills: ['performance-audit', 'architecture-review', 'test-generation'], category: 'Rule' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function readManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function writeManifest(projectRoot, manifest) {
  const manifestPath = path.join(projectRoot, MANIFEST_FILE);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

function isGitRepo(dir) {
  try {
    execSync('git rev-parse --git-dir', { cwd: dir, stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function fileWasUserModified(filePath, manifest) {
  if (!manifest || !manifest.files) return false;
  const record = manifest.files.find(f => f.target === filePath);
  if (!record) return false;
  if (!fs.existsSync(filePath)) return false;
  const currentContent = fs.readFileSync(filePath, 'utf8');
  return currentContent !== record.installedContent;
}

function filterFilesBySkills(files, selectedSkills) {
  return files.filter(f => {
    if (!f.skill && !f.skills) return true;
    if (f.skill && selectedSkills.includes(f.skill)) return true;
    if (f.skills && f.skills.some(s => selectedSkills.includes(s))) return true;
    return false;
  });
}

// ─── Interactive Graphical Questionnaire ──────────────────────────────────────

async function promptInstallationChoices(options) {
  const isInteractive = Boolean(process.stdin.isTTY && !options.yes);

  // 1. Choose IDE
  let ide = options.ide;
  if (!ide && isInteractive) {
    printStepHeader(1, 3, 'Select Target AI IDE / Environment');
    log(`    ${color('cyan', '1)')} ${color('bold', 'Google Antigravity')} ${color('dim', '(native Agent Skills + AGENTS.md)')} ${color('green', '★ Recommended')}`);
    log(`    ${color('cyan', '2)')} ${color('bold', 'Cursor')} ${color('dim', '(.cursor/rules/*.mdc)')}`);
    log(`    ${color('cyan', '3)')} ${color('bold', 'Both')} ${color('dim', '(Antigravity & Cursor dual support)')}`);
    log('');
    const answer = await ask('Select IDE [1-3]', '1');
    if (answer === '2' || answer === 'cursor') ide = 'cursor';
    else if (answer === '3' || answer === 'both') ide = 'both';
    else ide = 'antigravity';
  } else if (!ide) {
    ide = 'both';
  }

  // 2. Choose Skills
  let selectedSkills = ALL_SKILLS;
  if (options.skills) {
    if (options.skills === 'review') {
      selectedSkills = ['code-review', 'security-audit', 'performance-audit'];
    } else if (options.skills === 'dev') {
      selectedSkills = ['bug-fix', 'feature-development', 'refactor', 'test-generation'];
    } else if (options.skills !== 'all') {
      selectedSkills = options.skills.split(',').map(s => s.trim()).filter(s => ALL_SKILLS.includes(s));
    }
  } else if (isInteractive) {
    printStepHeader(2, 3, 'Select Capabilities & Skills to Install');
    log(`    ${color('cyan', '1)')} ${color('bold', 'All 8 Skills')} ${color('dim', '(Review, Bug Fix, Feature, Refactor, Security, Perf, Arch, Tests)')} ${color('green', '★ Default')}`);
    log(`    ${color('cyan', '2)')} ${color('bold', 'Code Review & Quality only')} ${color('dim', '(code-review, security-audit, performance-audit)')}`);
    log(`    ${color('cyan', '3)')} ${color('bold', 'Development & Testing only')} ${color('dim', '(bug-fix, feature-development, refactor, test-generation)')}`);
    log(`    ${color('cyan', '4)')} ${color('bold', 'Custom Selection')} ${color('dim', '(choose exact skills)')}`);
    log('');
    const answer = await ask('Select skills [1-4]', '1');
    if (answer === '2') {
      selectedSkills = ['code-review', 'security-audit', 'performance-audit'];
    } else if (answer === '3') {
      selectedSkills = ['bug-fix', 'feature-development', 'refactor', 'test-generation'];
    } else if (answer === '4') {
      log('\n  Available skills:');
      ALL_SKILLS.forEach((s, idx) => log(`    ${color('cyan', String(idx + 1) + ')')} ${s}`));
      log('');
      const chosen = await ask('Enter comma-separated numbers (e.g. 1,2,5)', '1,2,3,4,5,6,7,8');
      const indices = chosen.split(',').map(n => parseInt(n.trim(), 10) - 1).filter(i => i >= 0 && i < ALL_SKILLS.length);
      selectedSkills = indices.map(i => ALL_SKILLS[i]);
    }
  }

  // 3. Choose Report Language
  let lang = options.lang;
  if (!lang && isInteractive) {
    printStepHeader(3, 3, 'Select Review Report Output Language');
    log(`    ${color('cyan', '1)')} ${color('bold', 'Persian / فارسی (fa)')} ${color('green', '★ پیش‌فرض')} ${color('dim', '(شواهد انگلیسی، توضیحات فارسی)')}`);
    log(`    ${color('cyan', '2)')} ${color('bold', 'English (en)')} ${color('dim', '(full English report)')}`);
    log('');
    const answer = await ask('Select language [1-2]', '1');
    lang = (answer === '2' || answer === 'en' || answer === 'english') ? 'en' : 'fa';
  } else if (!lang) {
    lang = 'fa';
  }

  return { ide, selectedSkills, lang };
}

// ─── File Installation Core ───────────────────────────────────────────────────

async function installFile(projectRoot, fileSpec, manifest, options = {}) {
  const force = options.force || options.overwrite;
  const autoMerge = options.merge;
  const sourcePath = path.join(STARTER_KIT_DIR, fileSpec.source);
  const targetPath = path.join(projectRoot, fileSpec.target);
  const targetDir  = path.dirname(targetPath);

  if (!fs.existsSync(sourcePath)) {
    err(`Source file not found: ${fileSpec.source}`);
    return false;
  }

  const newContent = fs.readFileSync(sourcePath, 'utf8');

  // Check existing file
  if (fs.existsSync(targetPath) && !force) {
    const existingContent = fs.readFileSync(targetPath, 'utf8');

    if (existingContent === newContent) {
      log(`  ${color('gray', '•')} ${color('dim', fileSpec.target)} ${color('dim', '(up-to-date)')}`);
      return true;
    }

    // Special handling for user-modifiable files like AGENTS.md
    if (fileSpec.userModifiable && fileSpec.target === 'AGENTS.md') {
      if (existingContent.includes('AI Development Rules')) {
        ok(`${color('cyan', '[Merged]')} ${fileSpec.target} (rules already merged)`);
        return true;
      }

      // If --merge flag given, or -y/non-interactive, merge automatically
      if (autoMerge || options.yes || !process.stdin.isTTY) {
        fs.appendFileSync(targetPath, '\n\n---\n\n' + newContent);
        ok(`${color('cyan', '[Merged]')} ${fileSpec.target} ${color('dim', '(automatically appended kit rules)')}`);
        return true;
      }

      // Interactive prompt defaulting to merge
      log('');
      warn(`Existing ${fileSpec.target} detected with your local project notes.`);
      const choice = await ask(`Handle ${fileSpec.target}? [m = merge (keep notes + append rules), y = overwrite, n = skip]`, 'm');
      if (choice === 'm' || choice === 'merge') {
        fs.appendFileSync(targetPath, '\n\n---\n\n' + newContent);
        ok(`${color('cyan', '[Merged]')} ${fileSpec.target} (preserved your notes & appended rules)`);
        return true;
      }
      if (choice !== 'y' && choice !== 'yes') {
        warn(`Skipped: ${fileSpec.target}`);
        return true;
      }
    } else if (fileWasUserModified(targetPath, manifest)) {
      warn(`File has local modifications: ${fileSpec.target}`);
      if (process.stdin.isTTY) {
        const choice = await ask(`Overwrite ${fileSpec.target}? [y = yes, n = skip]`, 'n');
        if (choice !== 'y' && choice !== 'yes') {
          warn(`Skipped: ${fileSpec.target}`);
          return true;
        }
      }
    }
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.writeFileSync(targetPath, newContent);
  const cat = fileSpec.category ? `[${fileSpec.category}]` : '';
  ok(`${color('dim', cat.padEnd(10))} ${fileSpec.target}`);

  if (manifest && manifest.files) {
    const existing = manifest.files.find(f => f.target === fileSpec.target);
    if (existing) {
      existing.installedContent = newContent;
      existing.installedAt = new Date().toISOString();
    } else {
      manifest.files.push({
        target: fileSpec.target,
        source: fileSpec.source,
        installedAt: new Date().toISOString(),
        installedContent: newContent,
      });
    }
  }

  return true;
}

function installProjectContext(projectRoot, lang) {
  const contextPath = path.join(projectRoot, '.agents', 'project-context.md');
  if (fs.existsSync(contextPath)) {
    log(`  ${color('gray', '•')} ${color('dim', '.agents/project-context.md')} ${color('dim', '(preserved user config)')}`);
    return;
  }

  const dir = path.join(projectRoot, '.agents');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const ctx = detectProjectContext(projectRoot);
  if (lang) ctx.reportLanguage = lang;

  const content = renderProjectContextMarkdown(ctx);
  fs.writeFileSync(contextPath, content, 'utf8');
  ok(`${color('dim', '[Context]'.padEnd(10))} .agents/project-context.md`);
  sub(`Detected: ${ctx.backendFramework || 'none'} • ${ctx.frontendFramework || 'none'} • lang: ${ctx.reportLanguage}`);
}

// ─── Commands ─────────────────────────────────────────────────────────────────

async function cmdInit(projectRoot, options) {
  printBanner();

  if (!fs.existsSync(projectRoot)) {
    err(`Target directory does not exist: ${projectRoot}`);
    process.exit(1);
  }

  // Pre-scan project
  const ctx = detectProjectContext(projectRoot);
  printCard('Workspace Context', {
    'Project':     ctx.projectName,
    'Directory':   projectRoot,
    'Backend':     `${ctx.backendLanguage || 'none'} (${ctx.backendFramework || 'none'})`,
    'Frontend':    `${ctx.frontendLanguage || 'none'} (${ctx.frontendFramework || 'none'})`,
    'Styling':     ctx.styling || 'none',
    'Test Runner': ctx.testFramework || 'none',
    'Git Repo':    isGitRepo(projectRoot) ? 'Yes (ready for code reviews)' : 'No (init git for diff reviews)',
  });

  // Questionnaire / options resolution
  const { ide, selectedSkills, lang } = await promptInstallationChoices(options);

  log('');
  log(color('gray', '  ──────────────────────────────────────────────────────────'));
  info(`Installing ${color('bold', selectedSkills.length)} skills for ${color('bold', color('cyan', ide.toUpperCase()))}...`);
  log('');

  const manifest = readManifest(projectRoot) || {
    version: MANIFEST_VERSION,
    ide,
    installedSkills: selectedSkills,
    installedAt: new Date().toISOString(),
    projectRoot,
    files: [],
  };
  manifest.ide = ide;
  manifest.installedSkills = selectedSkills;

  let filesToInstall = [];
  if (ide === 'antigravity') {
    filesToInstall = filterFilesBySkills(ANTIGRAVITY_FILES, selectedSkills);
  } else if (ide === 'cursor') {
    filesToInstall = filterFilesBySkills(CURSOR_FILES, selectedSkills);
  } else {
    const combined = [...new Map([...ANTIGRAVITY_FILES, ...CURSOR_FILES].map(f => [f.target, f])).values()];
    filesToInstall = filterFilesBySkills(combined, selectedSkills);
  }

  for (const fileSpec of filesToInstall) {
    await installFile(projectRoot, fileSpec, manifest, options);
  }

  installProjectContext(projectRoot, lang);
  writeManifest(projectRoot, manifest);

  log('');
  log(color('green', '  ╭──────────────────────────────────────────────────────────────╮'));
  log(color('green', '  │') + `   ${color('bold', color('white', '🎉  Installation Completed Successfully!'))}                  ` + color('green', '│'));
  log(color('green', '  ├──────────────────────────────────────────────────────────────┤'));
  if (ide === 'antigravity' || ide === 'both') {
    log(color('green', '  │') + `  ${color('cyan', '•')} In Antigravity: Open chat & say: ${color('bold', '"review my code"')}      ` + color('green', '│'));
  }
  if (ide === 'cursor' || ide === 'both') {
    log(color('green', '  │') + `  ${color('cyan', '•')} In Cursor: Rules loaded! Mention: ${color('bold', '@code-review.mdc')}         ` + color('green', '│'));
  }
  log(color('green', '  │') + `  ${color('gray', '•')} Run health check: ${color('bold', 'ai-dev-starter doctor')}                 ` + color('green', '│'));
  log(color('green', '  ╰──────────────────────────────────────────────────────────────╯'));
  log('');
}

async function cmdUpdate(projectRoot, options) {
  printBanner();
  info(`Updating AI Dev Starter in ${color('bold', projectRoot)}...`);

  const manifest = readManifest(projectRoot);
  if (!manifest) {
    err(`No manifest found in ${projectRoot}. Run 'ai-dev-starter init' first.`);
    process.exit(1);
  }

  const ide = options.ide || manifest.ide || 'both';
  const selectedSkills = manifest.installedSkills || ALL_SKILLS;

  let filesToInstall = [];
  if (ide === 'antigravity') {
    filesToInstall = filterFilesBySkills(ANTIGRAVITY_FILES, selectedSkills);
  } else if (ide === 'cursor') {
    filesToInstall = filterFilesBySkills(CURSOR_FILES, selectedSkills);
  } else {
    const combined = [...new Map([...ANTIGRAVITY_FILES, ...CURSOR_FILES].map(f => [f.target, f])).values()];
    filesToInstall = filterFilesBySkills(combined, selectedSkills);
  }

  log('');
  for (const fileSpec of filesToInstall) {
    await installFile(projectRoot, fileSpec, manifest, options);
  }

  manifest.updatedAt = new Date().toISOString();
  writeManifest(projectRoot, manifest);
  log('');
  ok('Update complete.');
}

function cmdDoctor(projectRoot) {
  printBanner();
  info(`Running diagnostics for ${color('bold', projectRoot)}...`);
  log('');

  const manifest = readManifest(projectRoot);
  if (!manifest) {
    warn('No manifest found. Run: npx ai-dev-starter init');
    return;
  }

  printCard('System Manifest', {
    'Version':    manifest.version,
    'Target IDE': manifest.ide,
    'Skills':     (manifest.installedSkills || ALL_SKILLS).join(', '),
    'Installed':  manifest.installedAt ? manifest.installedAt.split('T')[0] : 'unknown',
  });

  const ide = manifest.ide || 'both';
  const selectedSkills = manifest.installedSkills || ALL_SKILLS;

  let expectedFiles = [];
  if (ide === 'antigravity') {
    expectedFiles = filterFilesBySkills(ANTIGRAVITY_FILES, selectedSkills);
  } else if (ide === 'cursor') {
    expectedFiles = filterFilesBySkills(CURSOR_FILES, selectedSkills);
  } else {
    const combined = [...new Map([...ANTIGRAVITY_FILES, ...CURSOR_FILES].map(f => [f.target, f])).values()];
    expectedFiles = filterFilesBySkills(combined, selectedSkills);
  }

  let issues = 0;

  for (const fileSpec of expectedFiles) {
    const targetPath = path.join(projectRoot, fileSpec.target);
    if (!fs.existsSync(targetPath)) {
      err(`Missing: ${fileSpec.target}`);
      issues++;
    } else if (fileWasUserModified(targetPath, manifest)) {
      warn(`User-modified: ${fileSpec.target}`);
    } else {
      ok(`${color('dim', '[OK]'.padEnd(6))} ${fileSpec.target}`);
    }
  }

  const contextPath = path.join(projectRoot, '.agents', 'project-context.md');
  if (!fs.existsSync(contextPath)) {
    warn('.agents/project-context.md missing');
    issues++;
  } else {
    ok(`${color('dim', '[OK]'.padEnd(6))} .agents/project-context.md`);
  }

  if (isGitRepo(projectRoot)) {
    ok(`${color('dim', '[OK]'.padEnd(6))} Git repository detected`);
  } else {
    warn('Not a git repository — git analysis requires git');
  }

  log('');
  if (issues === 0) {
    log(color('green', '  ✔ All checks passed. Everything is healthy and ready!'));
  } else {
    warn(`${issues} issue(s) found. Run: npx ai-dev-starter update`);
  }
  log('');
}

function cmdDetect(projectRoot) {
  printBanner();
  const ctx = detectProjectContext(projectRoot);
  printCard('Detected Tech Stack', {
    'Project':     ctx.projectName,
    'Backend':     `${ctx.backendLanguage || 'none'} (${ctx.backendFramework || 'none'})`,
    'Frontend':    `${ctx.frontendLanguage || 'none'} (${ctx.frontendFramework || 'none'})`,
    'Styling':     ctx.styling || 'none',
    'Databases':   ctx.databases.map(d => `${d.type}/${d.orm}`).join(', ') || 'none',
    'Tests':       `${ctx.testFramework || 'none'} (${ctx.commands.test})`,
    'Dev Server':  ctx.commands.dev_server || 'none',
    'Pattern':     ctx.architecturePattern || 'Modular',
  });
}

async function cmdUninstall(projectRoot) {
  printBanner();
  warn('This will remove files installed by ai-dev-starter.');
  warn('User-modified files will be preserved.');
  log('');

  const manifest = readManifest(projectRoot);
  if (!manifest) {
    err('No manifest found. Nothing to uninstall.');
    process.exit(1);
  }

  if (process.stdin.isTTY) {
    const confirm = await ask('Type "yes" to proceed with uninstallation', 'no');
    if (confirm !== 'yes') {
      info('Uninstallation cancelled.');
      return;
    }
  }

  for (const record of manifest.files) {
    const targetPath = path.join(projectRoot, record.target);
    if (!fs.existsSync(targetPath)) continue;

    if (fileWasUserModified(targetPath, manifest)) {
      warn(`User-modified — keeping: ${record.target}`);
      continue;
    }

    fs.unlinkSync(targetPath);
    ok(`Removed: ${record.target}`);
  }

  const manifestPath = path.join(projectRoot, MANIFEST_FILE);
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
    ok(`Removed: ${MANIFEST_FILE}`);
  }

  log('');
  ok('Uninstallation complete.');
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  let command = args[0] && !args[0].startsWith('-') ? args[0] : null;

  const options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--target' && args[i + 1]) options.target = args[++i];
    else if (arg === '--ide' && args[i + 1]) options.ide = args[++i];
    else if (arg === '--skills' && args[i + 1]) options.skills = args[++i];
    else if (arg === '--lang' && args[i + 1]) options.lang = args[++i];
    else if (arg === '--merge') options.merge = true;
    else if (arg === '-y' || arg === '--yes') options.yes = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
  }

  if (!command) {
    command = options.help ? 'help' : 'init';
  }

  return { command, options };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { command, options } = parseArgs(process.argv);
  const projectRoot = path.resolve(options.target || process.cwd());

  switch (command) {
    case 'init':      await cmdInit(projectRoot, options); break;
    case 'update':    await cmdUpdate(projectRoot, options); break;
    case 'doctor':    cmdDoctor(projectRoot); break;
    case 'detect':    cmdDetect(projectRoot); break;
    case 'uninstall': await cmdUninstall(projectRoot); break;
    default:
      printBanner();
      log('  Usage:');
      log(`    ${color('cyan', 'npx ai-dev-starter')} ${color('bold', '[init]')} ${color('dim', '[--ide antigravity|cursor|both] [--skills all|review|dev|<list>] [--lang fa|en] [--merge] [-y]')}`);
      log(`    ${color('cyan', 'npx ai-dev-starter')} ${color('bold', 'update')}  ${color('dim', '[--target <path>]')}`);
      log(`    ${color('cyan', 'npx ai-dev-starter')} ${color('bold', 'doctor')}  ${color('dim', '[--target <path>]')}`);
      log(`    ${color('cyan', 'npx ai-dev-starter')} ${color('bold', 'detect')}  ${color('dim', '[--target <path>]')}`);
      log(`    ${color('cyan', 'npx ai-dev-starter')} ${color('bold', 'uninstall')} ${color('dim', '[--target <path>]')}`);
      log('');
      process.exit(0);
  }
}

main().catch(e => {
  err(e.message);
  process.exit(1);
});
