# Starterkit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modular Claude CLI plugin for small AI teams with session tracking, publish workflows, and security audits.

**Architecture:** Monorepo with TypeScript/Node.js core + optional npm scoped modules. Claude CLI plugin API for installation. Background tracker daemon for session capture. CLI commands orchestrate workflows and generate interactive HTML reports.

**Tech Stack:** TypeScript, Node.js, Commander.js, simple-git, Handlebars (HTML templates), pm2 (daemon), Playwright (visual-qa), Express/React (dashboard)

---

## Phase 1: Project Setup & Foundation

### Task 1: Initialize TypeScript Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `README.md`

**Step 1: Write package.json test**

Create: `tests/project-setup.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Project Setup', () => {
  it('should have valid package.json with required fields', () => {
    const pkgPath = resolve(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.name).toBe('starterkit');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.bin).toHaveProperty('starterkit');
    expect(pkg.main).toBeDefined();
    expect(pkg.types).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/project-setup.test.ts`
Expected: FAIL - "package.json not found" or missing fields

**Step 3: Create package.json**

```json
{
  "name": "starterkit",
  "version": "0.1.0",
  "description": "Claude CLI plugin for small AI development teams",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "starterkit": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "dev": "tsc --watch"
  },
  "keywords": ["claude", "cli", "plugin", "ai", "collaboration"],
  "author": "Jeff Lin",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "simple-git": "^3.20.0",
    "handlebars": "^4.7.8",
    "pm2": "^5.3.0"
  }
}
```

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 5: Create .gitignore**

```
node_modules/
dist/
*.log
.env
.starterkit/
docs/ai-sessions/*.html
docs/security/*.html
docs/publish/*.html
docs/code-review/*.html
docs/visual-qa/*.html
```

**Step 6: Run test to verify it passes**

Run: `npm install && npm test -- tests/project-setup.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add package.json tsconfig.json .gitignore README.md tests/
git commit -m "feat: initialize TypeScript project with test setup"
```

---

### Task 2: CLI Command Framework

**Files:**
- Create: `src/cli.ts`
- Create: `tests/cli.test.ts`

**Step 1: Write failing test for CLI entry point**

Create: `tests/cli.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Commands', () => {
  it('should show version with --version flag', async () => {
    const { stdout } = await execAsync('node dist/cli.js --version');
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should show help with --help flag', async () => {
    const { stdout } = await execAsync('node dist/cli.js --help');
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('init');
    expect(stdout).toContain('publish');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run build && npm test -- tests/cli.test.ts`
Expected: FAIL - "src/cli.ts not found"

**Step 3: Implement minimal CLI**

Create: `src/cli.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('starterkit')
  .description('Claude CLI plugin for small AI development teams')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize starterkit in current project')
  .action(() => {
    console.log('Initializing starterkit...');
  });

program
  .command('publish')
  .description('Run full pre-merge workflow')
  .option('--skip-visual-qa', 'Skip visual QA checks')
  .option('--skip-security-audit', 'Skip security audit')
  .action((options) => {
    console.log('Running publish workflow...', options);
  });

program.parse();
```

**Step 4: Make CLI executable**

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "tsc && chmod +x dist/cli.js"
  }
}
```

**Step 5: Run test to verify it passes**

Run: `npm run build && npm test -- tests/cli.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/cli.ts tests/cli.test.ts package.json
git commit -m "feat: add CLI framework with init and publish commands"
```

---

## Phase 2: Core Directory Structure

### Task 3: Init Command - Directory Creation

**Files:**
- Create: `src/commands/init.ts`
- Create: `tests/commands/init.test.ts`

**Step 1: Write failing test for directory creation**

Create: `tests/commands/init.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';
import { initCommand } from '../../src/commands/init';

describe('Init Command', () => {
  const testDir = resolve(__dirname, '../fixtures/test-project');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(__dirname);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should create required directories', async () => {
    await initCommand();

    expect(existsSync('docs/ai-sessions')).toBe(true);
    expect(existsSync('docs/security')).toBe(true);
    expect(existsSync('docs/publish')).toBe(true);
    expect(existsSync('docs/code-review')).toBe(true);
    expect(existsSync('docs/plans')).toBe(true);
    expect(existsSync('.starterkit')).toBe(true);
  });

  it('should create config file', async () => {
    await initCommand();

    expect(existsSync('.starterkit/config.json')).toBe(true);
    const config = JSON.parse(
      readFileSync('.starterkit/config.json', 'utf-8')
    );
    expect(config.version).toBeDefined();
    expect(config.modules).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/commands/init.test.ts`
Expected: FAIL - "initCommand is not defined"

**Step 3: Implement init command**

Create: `src/commands/init.ts`

```typescript
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_DIRS = [
  'docs/ai-sessions',
  'docs/security',
  'docs/publish',
  'docs/code-review',
  'docs/plans',
  '.starterkit'
];

export async function initCommand(): Promise<void> {
  console.log('Initializing starterkit...\n');

  // Create directories
  REQUIRED_DIRS.forEach(dir => {
    const fullPath = resolve(process.cwd(), dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created ${dir}/`);
    } else {
      console.log(`- ${dir}/ already exists`);
    }
  });

  // Create config
  const configPath = resolve(process.cwd(), '.starterkit/config.json');
  if (!existsSync(configPath)) {
    const config = {
      version: '0.1.0',
      modules: [],
      settings: {
        autoTrack: true,
        reportFormat: 'html'
      }
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✓ Created .starterkit/config.json');
  }

  console.log('\n✨ Starterkit initialized successfully!');
}
```

**Step 4: Wire up to CLI**

Update: `src/cli.ts`

```typescript
import { initCommand } from './commands/init';

// ... existing code ...

program
  .command('init')
  .description('Initialize starterkit in current project')
  .action(async () => {
    await initCommand();
  });
```

**Step 5: Run test to verify it passes**

Run: `npm run build && npm test -- tests/commands/init.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/commands/init.ts tests/commands/init.test.ts src/cli.ts
git commit -m "feat: implement init command with directory creation"
```

---

## Phase 3: AI Session Tracker

### Task 4: Session Data Model

**Files:**
- Create: `src/tracker/types.ts`
- Create: `tests/tracker/types.test.ts`

**Step 1: Write test for session data structure**

Create: `tests/tracker/types.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { Session, SubAgent, validateSession } from '../../src/tracker/types';

describe('Session Types', () => {
  it('should validate complete session object', () => {
    const session: Session = {
      id: 'session-123',
      timestamp: new Date().toISOString(),
      user: 'test-user',
      branch: 'feature/test',
      mainPrompt: 'Add user authentication',
      filesModified: ['src/auth.ts'],
      subAgents: [],
      codeChanges: []
    };

    expect(validateSession(session)).toBe(true);
  });

  it('should validate session with sub-agents', () => {
    const subAgent: SubAgent = {
      type: 'Explore',
      task: 'Find existing auth patterns',
      results: 'Found 3 auth files'
    };

    const session: Session = {
      id: 'session-124',
      timestamp: new Date().toISOString(),
      user: 'test-user',
      branch: 'feature/test',
      mainPrompt: 'Add authentication',
      filesModified: ['src/auth.ts'],
      subAgents: [subAgent],
      codeChanges: []
    };

    expect(validateSession(session)).toBe(true);
    expect(session.subAgents).toHaveLength(1);
    expect(session.subAgents[0].type).toBe('Explore');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/tracker/types.test.ts`
Expected: FAIL - "types not defined"

**Step 3: Implement types**

Create: `src/tracker/types.ts`

```typescript
export interface SubAgent {
  type: 'Explore' | 'Plan' | 'general-purpose' | 'Bash' | string;
  task: string;
  results: string;
  subAgents?: SubAgent[]; // Nested sub-agents
}

export interface CodeChange {
  file: string;
  additions: number;
  deletions: number;
  diff?: string;
}

export interface Session {
  id: string;
  timestamp: string;
  user: string;
  branch: string;
  mainPrompt: string;
  filesModified: string[];
  subAgents: SubAgent[];
  codeChanges: CodeChange[];
  incomplete?: boolean;
}

export function validateSession(session: Session): boolean {
  return !!(
    session.id &&
    session.timestamp &&
    session.user &&
    session.mainPrompt &&
    Array.isArray(session.filesModified) &&
    Array.isArray(session.subAgents) &&
    Array.isArray(session.codeChanges)
  );
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/tracker/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tracker/types.ts tests/tracker/types.test.ts
git commit -m "feat: add session data model with validation"
```

---

### Task 5: HTML Report Generator

**Files:**
- Create: `src/tracker/html-generator.ts`
- Create: `src/tracker/templates/session-report.hbs`
- Create: `tests/tracker/html-generator.test.ts`

**Step 1: Write test for HTML generation**

Create: `tests/tracker/html-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generateSessionHTML } from '../../src/tracker/html-generator';
import { Session } from '../../src/tracker/types';

describe('HTML Generator', () => {
  it('should generate valid HTML from session', () => {
    const session: Session = {
      id: 'session-123',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'feature/auth',
      mainPrompt: 'Add user authentication',
      filesModified: ['src/auth.ts', 'tests/auth.test.ts'],
      subAgents: [
        {
          type: 'Explore',
          task: 'Find auth patterns',
          results: 'Found JWT implementation'
        }
      ],
      codeChanges: [
        {
          file: 'src/auth.ts',
          additions: 50,
          deletions: 5
        }
      ]
    };

    const html = generateSessionHTML(session);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('session-123');
    expect(html).toContain('Add user authentication');
    expect(html).toContain('src/auth.ts');
    expect(html).toContain('Explore');
    expect(html).toContain('button'); // Copy buttons
  });

  it('should handle nested sub-agents', () => {
    const session: Session = {
      id: 'session-124',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'main',
      mainPrompt: 'Complex feature',
      filesModified: [],
      subAgents: [
        {
          type: 'Plan',
          task: 'Design architecture',
          results: 'Created plan',
          subAgents: [
            {
              type: 'Explore',
              task: 'Research patterns',
              results: 'Found examples'
            }
          ]
        }
      ],
      codeChanges: []
    };

    const html = generateSessionHTML(session);
    expect(html).toContain('Plan');
    expect(html).toContain('Explore');
    expect(html).toContain('Research patterns');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/tracker/html-generator.test.ts`
Expected: FAIL - "generateSessionHTML not defined"

**Step 3: Create Handlebars template**

Create: `src/tracker/templates/session-report.hbs`

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session {{id}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; max-width: 1200px; margin: 0 auto; background: #f5f5f5; }
    .header { background: white; padding: 2rem; border-radius: 8px; margin-bottom: 1rem; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; color: #666; font-size: 0.9rem; }
    .section { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    .section h2 { margin-bottom: 1rem; color: #333; }
    .copy-btn { background: #0066cc; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .copy-btn:hover { background: #0052a3; }
    .sub-agent { border-left: 3px solid #0066cc; padding-left: 1rem; margin: 1rem 0; }
    .sub-agent-nested { border-left-color: #666; margin-left: 1rem; }
    .code-change { background: #f9f9f9; padding: 1rem; border-radius: 4px; margin: 0.5rem 0; font-family: 'Courier New', monospace; font-size: 0.9rem; }
    .stats { color: #666; font-size: 0.85rem; }
    .additions { color: #28a745; }
    .deletions { color: #dc3545; }
    details { margin: 0.5rem 0; }
    summary { cursor: pointer; font-weight: 500; padding: 0.5rem; background: #f0f0f0; border-radius: 4px; }
    summary:hover { background: #e0e0e0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Session Report</h1>
    <div class="meta">
      <div><strong>Session ID:</strong> {{id}}</div>
      <div><strong>Date:</strong> {{timestamp}}</div>
      <div><strong>User:</strong> {{user}}</div>
      <div><strong>Branch:</strong> {{branch}}</div>
    </div>
  </div>

  <div class="section">
    <h2>Main Prompt</h2>
    <p>{{mainPrompt}}</p>
    <button class="copy-btn" onclick="copyToClipboard('{{mainPrompt}}')">Copy Prompt</button>
  </div>

  {{#if subAgents.length}}
  <div class="section">
    <h2>Sub-Agent Activity</h2>
    {{#each subAgents}}
      {{> subAgentPartial this}}
    {{/each}}
  </div>
  {{/if}}

  {{#if filesModified.length}}
  <div class="section">
    <h2>Files Modified</h2>
    <ul>
      {{#each filesModified}}
        <li><code>{{this}}</code></li>
      {{/each}}
    </ul>
  </div>
  {{/if}}

  {{#if codeChanges.length}}
  <div class="section">
    <h2>Code Changes</h2>
    {{#each codeChanges}}
      <div class="code-change">
        <strong>{{file}}</strong>
        <div class="stats">
          <span class="additions">+{{additions}}</span>
          <span class="deletions">-{{deletions}}</span>
        </div>
      </div>
    {{/each}}
  </div>
  {{/if}}

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  </script>
</body>
</html>
```

**Step 4: Implement HTML generator**

Create: `src/tracker/html-generator.ts`

```typescript
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Session, SubAgent } from './types';

// Register partial for recursive sub-agents
Handlebars.registerPartial('subAgentPartial', `
  <details class="sub-agent {{#if subAgents}}sub-agent-nested{{/if}}" open>
    <summary><strong>{{type}}:</strong> {{task}}</summary>
    <p>{{results}}</p>
    <button class="copy-btn" onclick="copyToClipboard('{{task}}\\n{{results}}')">Copy</button>
    {{#if subAgents}}
      {{#each subAgents}}
        {{> subAgentPartial this}}
      {{/each}}
    {{/if}}
  </details>
`);

let templateCache: HandlebarsTemplateDelegate<Session> | null = null;

function getTemplate(): HandlebarsTemplateDelegate<Session> {
  if (!templateCache) {
    const templatePath = resolve(__dirname, 'templates/session-report.hbs');
    const templateSource = readFileSync(templatePath, 'utf-8');
    templateCache = Handlebars.compile(templateSource);
  }
  return templateCache;
}

export function generateSessionHTML(session: Session): string {
  const template = getTemplate();
  return template(session);
}
```

**Step 5: Run test to verify it passes**

Run: `npm run build && npm test -- tests/tracker/html-generator.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/tracker/html-generator.ts src/tracker/templates/ tests/tracker/html-generator.test.ts
git commit -m "feat: add HTML report generator with Handlebars templates"
```

---

### Task 6: Session File Writer

**Files:**
- Create: `src/tracker/session-writer.ts`
- Create: `tests/tracker/session-writer.test.ts`

**Step 1: Write test for session file creation**

Create: `tests/tracker/session-writer.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { writeSession } from '../../src/tracker/session-writer';
import { Session } from '../../src/tracker/types';

describe('Session Writer', () => {
  const testDir = resolve(__dirname, '../fixtures/test-project');

  beforeEach(() => {
    mkdirSync(`${testDir}/docs/ai-sessions`, { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(__dirname);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should write session to HTML file', async () => {
    const session: Session = {
      id: 'session-123',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'main',
      mainPrompt: 'Test prompt',
      filesModified: [],
      subAgents: [],
      codeChanges: []
    };

    const filePath = await writeSession(session, 'test-topic');

    expect(existsSync(filePath)).toBe(true);
    expect(filePath).toMatch(/docs\/ai-sessions\/\d{4}-\d{2}-\d{2}-\d{6}-test-topic\.html$/);
  });

  it('should sanitize topic names', async () => {
    const session: Session = {
      id: 'session-124',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'main',
      mainPrompt: 'Test',
      filesModified: [],
      subAgents: [],
      codeChanges: []
    };

    const filePath = await writeSession(session, 'User/Auth Feature!');

    expect(filePath).toMatch(/user-auth-feature\.html$/);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/tracker/session-writer.test.ts`
Expected: FAIL - "writeSession not defined"

**Step 3: Implement session writer**

Create: `src/tracker/session-writer.ts`

```typescript
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Session } from './types';
import { generateSessionHTML } from './html-generator';

function sanitizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFilename(timestamp: string, topic: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const sanitized = sanitizeTopic(topic);
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}-${sanitized}.html`;
}

export async function writeSession(session: Session, topic: string): Promise<string> {
  const html = generateSessionHTML(session);
  const filename = generateFilename(session.timestamp, topic);
  const filePath = resolve(process.cwd(), 'docs/ai-sessions', filename);

  writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/tracker/session-writer.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/tracker/session-writer.ts tests/tracker/session-writer.test.ts
git commit -m "feat: add session file writer with filename generation"
```

---

## Phase 4: Skills System

### Task 7: Skill File Structure

**Files:**
- Create: `core/skills/publish/skill.md`
- Create: `core/skills/onboard/skill.md`
- Create: `core/skills/security-audit/skill.md`
- Create: `core/skills/review-changes/skill.md`
- Create: `tests/skills/skill-validation.test.ts`

**Step 1: Write test for skill validation**

Create: `tests/skills/skill-validation.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Skill Validation', () => {
  const skillsDir = resolve(__dirname, '../../core/skills');

  it('should have required custom skills', () => {
    const requiredSkills = ['publish', 'onboard', 'security-audit', 'review-changes'];

    requiredSkills.forEach(skill => {
      const skillPath = resolve(skillsDir, skill);
      expect(existsSync(skillPath)).toBe(true);
      expect(existsSync(`${skillPath}/skill.md`)).toBe(true);
    });
  });

  it('should have valid skill.md format', () => {
    const publishSkill = readFileSync(
      resolve(skillsDir, 'publish/skill.md'),
      'utf-8'
    );

    expect(publishSkill).toContain('---');
    expect(publishSkill).toContain('name:');
    expect(publishSkill).toContain('description:');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/skills/skill-validation.test.ts`
Expected: FAIL - "skills not found"

**Step 3: Create publish skill**

Create: `core/skills/publish/skill.md`

```markdown
---
name: publish
description: Run comprehensive pre-merge workflow (TDD, code review, security, visual QA, PR creation)
---

# Publish Workflow

Run the full pre-merge validation workflow to ensure code quality before creating a PR.

## Steps

1. **Run Tests** - Execute test suite and verify coverage
2. **Code Review** - Send changes to Codex for analysis
3. **Security Audit** - Run VibeSec + AI-specific checks
4. **Visual QA** - Manual checklist or automated (if visual-qa module installed)
5. **Create PR** - Generate PR with links to all reports

## Usage

```bash
starterkit publish

# Skip specific checks
starterkit publish --skip-visual-qa
starterkit publish --skip-security-audit
```

## Workflow

**This skill orchestrates multiple tools:**

1. Check for uncommitted changes
2. Run test suite (use @superpowers:test-driven-development patterns)
3. Generate test report in `docs/publish/`
4. Send code to Codex for review
5. Generate code review report in `docs/code-review/`
6. If issues found: show copy-able details, wait for fixes
7. Run `/security-audit` skill
8. Run visual QA (manual prompt or automated if module exists)
9. Commit all reports to current branch
10. Create PR with `gh pr create`, linking all reports

## Error Handling

- If tests fail: show errors, don't proceed
- If Codex finds issues: iterate with user
- If security audit fails: show findings, user decides to proceed or fix
- If PR creation fails: show manual `gh` command

## Reports Generated

All reports committed to branch before PR creation:

- `docs/publish/YYYY-MM-DD-HHmmss-<branch>.html`
- `docs/code-review/YYYY-MM-DD-HHmmss-review.html`
- `docs/security/YYYY-MM-DD-HHmmss-audit.html`
- `docs/visual-qa/YYYY-MM-DD-HHmmss-comparison.html` (if module installed)
```

**Step 4: Create other skills**

Create: `core/skills/onboard/skill.md`

```markdown
---
name: onboard
description: Interactive onboarding for new team members
---

# Team Member Onboarding

Guide new developers through setup and introduce team workflows.

## Checklist

1. Verify Node.js, Claude CLI, git installed
2. Clone team repositories
3. Run `starterkit init` in main project
4. Explain core skills: `/publish`, `/security-audit`, `/debug`
5. Show example AI session reports
6. Practice task: create a simple component
7. Run `/publish` workflow on practice task
8. Review generated reports

## Output

- Session saved to `docs/ai-sessions/YYYY-MM-DD-HHmmss-onboarding.html`
- Checklist completion status
- Quick reference guide
```

Create: `core/skills/security-audit/skill.md`

```markdown
---
name: security-audit
description: Run VibeSec-Skill plus AI-specific security checks
---

# Security Audit

Comprehensive security scanning with AI-specific vulnerability detection.

## Checks

**VibeSec-Skill (imported):**
- General security best practices
- OWASP vulnerabilities
- Dependency scanning

**AI-Specific:**
- Prompt injection vulnerabilities
- PII in prompts/training data
- API key exposure in code/session logs
- Model access control validation
- Data leakage through outputs
- Unsafe deserialization

## Usage

```bash
starterkit security-audit
```

## Output

Interactive HTML report: `docs/security/YYYY-MM-DD-HHmmss-audit.html`

**Report sections:**
- Executive summary with severity counts
- VibeSec findings
- AI-specific findings
- Code snippets with vulnerabilities highlighted
- Copy-able remediation suggestions
- Compliance checklist
```

Create: `core/skills/review-changes/skill.md`

```markdown
---
name: review-changes
description: Re-analyze code with Codex after fixes
---

# Review Changes

Send updated code back to Codex for validation after addressing review findings.

## Usage

```bash
starterkit review-changes
```

## Process

1. Detect code changes since last review
2. Send to Codex with previous findings as context
3. Generate comparison report showing:
   - Original findings
   - Which issues were resolved
   - New issues introduced (if any)
   - Overall quality improvement

## Output

`docs/code-review/YYYY-MM-DD-HHmmss-review.html` with before/after comparison
```

**Step 5: Run test to verify it passes**

Run: `npm run build && npm test -- tests/skills/skill-validation.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add core/skills/ tests/skills/
git commit -m "feat: add custom skills (publish, onboard, security-audit, review-changes)"
```

---

## Phase 5: Git Integration

### Task 8: Git Operations Module

**Files:**
- Create: `src/git/operations.ts`
- Create: `tests/git/operations.test.ts`

**Step 1: Write test for git operations**

Create: `tests/git/operations.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import simpleGit from 'simple-git';
import {
  getCurrentBranch,
  getModifiedFiles,
  commitSessionReport,
  isGitRepo
} from '../../src/git/operations';

describe('Git Operations', () => {
  const testDir = resolve(__dirname, '../fixtures/git-test');

  beforeEach(async () => {
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    const git = simpleGit(testDir);
    await git.init();
    await git.addConfig('user.name', 'Test User');
    await git.addConfig('user.email', 'test@example.com');

    writeFileSync('README.md', '# Test');
    await git.add('README.md');
    await git.commit('Initial commit');
  });

  afterEach(() => {
    process.chdir(__dirname);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should detect git repository', async () => {
    expect(await isGitRepo()).toBe(true);
  });

  it('should get current branch', async () => {
    const branch = await getCurrentBranch();
    expect(branch).toBe('master');
  });

  it('should detect modified files', async () => {
    writeFileSync('test.ts', 'console.log("test")');

    const files = await getModifiedFiles();
    expect(files).toContain('test.ts');
  });

  it('should commit session report', async () => {
    mkdirSync('docs/ai-sessions', { recursive: true });
    const reportPath = 'docs/ai-sessions/2026-02-17-143022-test.html';
    writeFileSync(reportPath, '<html>Session</html>');

    await commitSessionReport(reportPath, 'session-123');

    const git = simpleGit();
    const log = await git.log();
    expect(log.latest?.message).toContain('session-123');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/git/operations.test.ts`
Expected: FAIL - "operations not defined"

**Step 3: Implement git operations**

Create: `src/git/operations.ts`

```typescript
import simpleGit, { SimpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export async function isGitRepo(): Promise<boolean> {
  try {
    await git.status();
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentBranch(): Promise<string> {
  const status = await git.status();
  return status.current || 'unknown';
}

export async function getModifiedFiles(): Promise<string[]> {
  const status = await git.status();
  return [
    ...status.modified,
    ...status.created,
    ...status.not_added
  ];
}

export async function commitSessionReport(
  reportPath: string,
  sessionId: string
): Promise<void> {
  await git.add(reportPath);
  await git.commit(`docs: add AI session report ${sessionId}\n\nGenerated by starterkit session tracker.`);
}

export async function getRecentCommits(count: number = 5): Promise<string[]> {
  const log = await git.log({ maxCount: count });
  return log.all.map(commit => commit.message);
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/git/operations.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/git/operations.ts tests/git/operations.test.ts package.json
git commit -m "feat: add git operations module with simple-git"
```

---

## Phase 6: Publish Command Implementation

### Task 9: Test Runner Integration

**Files:**
- Create: `src/commands/publish/test-runner.ts`
- Create: `tests/commands/publish/test-runner.test.ts`

**Step 1: Write test for test runner**

Create: `tests/commands/publish/test-runner.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { runTests, TestResult } from '../../../src/commands/publish/test-runner';

describe('Test Runner', () => {
  const testDir = resolve(__dirname, '../../fixtures/test-project');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    // Create package.json with test script
    writeFileSync('package.json', JSON.stringify({
      scripts: { test: 'echo "PASS"' }
    }));
  });

  afterEach(() => {
    process.chdir(__dirname);
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should run tests and return results', async () => {
    const result = await runTests();

    expect(result.success).toBe(true);
    expect(result.output).toContain('PASS');
  });

  it('should detect test failures', async () => {
    writeFileSync('package.json', JSON.stringify({
      scripts: { test: 'exit 1' }
    }));

    const result = await runTests();

    expect(result.success).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/commands/publish/test-runner.test.ts`
Expected: FAIL - "runTests not defined"

**Step 3: Implement test runner**

Create: `src/commands/publish/test-runner.ts`

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TestResult {
  success: boolean;
  output: string;
  error?: string;
}

export async function runTests(): Promise<TestResult> {
  try {
    console.log('Running test suite...\n');

    const { stdout, stderr } = await execAsync('npm test');

    return {
      success: true,
      output: stdout
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run build && npm test -- tests/commands/publish/test-runner.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/commands/publish/test-runner.ts tests/commands/publish/test-runner.test.ts
git commit -m "feat: add test runner for publish workflow"
```

---

### Task 10: Report Generator for Publish

**Files:**
- Create: `src/commands/publish/report-generator.ts`
- Create: `src/commands/publish/templates/publish-report.hbs`
- Create: `tests/commands/publish/report-generator.test.ts`

**Step 1: Write test for publish report generation**

Create: `tests/commands/publish/report-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generatePublishReport, PublishReport } from '../../../src/commands/publish/report-generator';

describe('Publish Report Generator', () => {
  it('should generate HTML report with all sections', () => {
    const report: PublishReport = {
      branch: 'feature/test',
      timestamp: '2026-02-17T14:30:22Z',
      testsPassed: true,
      testsOutput: 'All tests passed',
      codeReviewPassed: true,
      codeReviewReport: 'docs/code-review/2026-02-17-143022-review.html',
      securityAuditPassed: true,
      securityReport: 'docs/security/2026-02-17-143022-audit.html',
      visualQAPassed: true,
      visualQAReport: null,
      prUrl: null
    };

    const html = generatePublishReport(report);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('feature/test');
    expect(html).toContain('Tests');
    expect(html).toContain('Code Review');
    expect(html).toContain('Security Audit');
  });

  it('should show failures in red', () => {
    const report: PublishReport = {
      branch: 'feature/fail',
      timestamp: '2026-02-17T14:30:22Z',
      testsPassed: false,
      testsOutput: 'Tests failed',
      codeReviewPassed: false,
      codeReviewReport: null,
      securityAuditPassed: true,
      securityReport: 'docs/security/report.html',
      visualQAPassed: true,
      visualQAReport: null,
      prUrl: null
    };

    const html = generatePublishReport(report);

    expect(html).toContain('fail');
    expect(html).toContain('Tests failed');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/commands/publish/report-generator.test.ts`
Expected: FAIL - "generatePublishReport not defined"

**Step 3: Create template**

Create: `src/commands/publish/templates/publish-report.hbs`

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publish Report - {{branch}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 1000px; margin: 0 auto; background: #f5f5f5; }
    .header { background: white; padding: 2rem; border-radius: 8px; margin-bottom: 1rem; }
    .section { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; }
    .pass { color: #28a745; font-weight: bold; }
    .fail { color: #dc3545; font-weight: bold; }
    .step { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee; }
    .step:last-child { border-bottom: none; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .copy-btn { background: #0066cc; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem; }
    pre { background: #f9f9f9; padding: 1rem; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Publish Workflow Report</h1>
    <p><strong>Branch:</strong> {{branch}}</p>
    <p><strong>Date:</strong> {{timestamp}}</p>
  </div>

  <div class="section">
    <h2>Workflow Steps</h2>

    <div class="step">
      <span>1. Tests</span>
      <span class="{{#if testsPassed}}pass{{else}}fail{{/if}}">
        {{#if testsPassed}}✓ PASSED{{else}}✗ FAILED{{/if}}
      </span>
    </div>
    {{#unless testsPassed}}
      <pre>{{testsOutput}}</pre>
      <button class="copy-btn" onclick="copyToClipboard(`{{testsOutput}}`)">Copy Errors</button>
    {{/unless}}

    <div class="step">
      <span>2. Code Review</span>
      <span class="{{#if codeReviewPassed}}pass{{else}}fail{{/if}}">
        {{#if codeReviewPassed}}✓ PASSED{{else}}✗ FAILED{{/if}}
      </span>
    </div>
    {{#if codeReviewReport}}
      <a href="../../{{codeReviewReport}}" target="_blank">View Code Review Report</a>
    {{/if}}

    <div class="step">
      <span>3. Security Audit</span>
      <span class="{{#if securityAuditPassed}}pass{{else}}fail{{/if}}">
        {{#if securityAuditPassed}}✓ PASSED{{else}}✗ FAILED{{/if}}
      </span>
    </div>
    {{#if securityReport}}
      <a href="../../{{securityReport}}" target="_blank">View Security Report</a>
    {{/if}}

    <div class="step">
      <span>4. Visual QA</span>
      <span class="{{#if visualQAPassed}}pass{{else}}fail{{/if}}">
        {{#if visualQAPassed}}✓ PASSED{{else}}✗ FAILED{{/if}}
      </span>
    </div>
    {{#if visualQAReport}}
      <a href="../../{{visualQAReport}}" target="_blank">View Visual QA Report</a>
    {{/if}}
  </div>

  {{#if prUrl}}
  <div class="section">
    <h2>Pull Request</h2>
    <p><a href="{{prUrl}}" target="_blank">{{prUrl}}</a></p>
  </div>
  {{/if}}

  <script>
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => alert('Copied!'));
    }
  </script>
</body>
</html>
```

**Step 4: Implement report generator**

Create: `src/commands/publish/report-generator.ts`

```typescript
import Handlebars from 'handlebars';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export interface PublishReport {
  branch: string;
  timestamp: string;
  testsPassed: boolean;
  testsOutput: string;
  codeReviewPassed: boolean;
  codeReviewReport: string | null;
  securityAuditPassed: boolean;
  securityReport: string | null;
  visualQAPassed: boolean;
  visualQAReport: string | null;
  prUrl: string | null;
}

let templateCache: HandlebarsTemplateDelegate<PublishReport> | null = null;

function getTemplate(): HandlebarsTemplateDelegate<PublishReport> {
  if (!templateCache) {
    const templatePath = resolve(__dirname, 'templates/publish-report.hbs');
    const templateSource = readFileSync(templatePath, 'utf-8');
    templateCache = Handlebars.compile(templateSource);
  }
  return templateCache;
}

export function generatePublishReport(report: PublishReport): string {
  const template = getTemplate();
  return template(report);
}

export function savePublishReport(report: PublishReport): string {
  const html = generatePublishReport(report);

  const date = new Date(report.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const branch = report.branch.replace(/[^a-z0-9]+/gi, '-');
  const filename = `${year}-${month}-${day}-${hours}${minutes}${seconds}-${branch}.html`;
  const filePath = resolve(process.cwd(), 'docs/publish', filename);

  writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
```

**Step 5: Run test to verify it passes**

Run: `npm run build && npm test -- tests/commands/publish/report-generator.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/commands/publish/report-generator.ts src/commands/publish/templates/ tests/commands/publish/report-generator.test.ts
git commit -m "feat: add publish workflow report generator"
```

---

## Remaining Tasks (Summary)

Due to length constraints, here's a summary of remaining tasks to implement:

### Phase 7: Security Audit Integration
- Task 11: Import VibeSec-Skill files
- Task 12: Add AI-specific security checks
- Task 13: Generate security audit reports

### Phase 8: Codex Integration
- Task 14: Codex API client
- Task 15: Code review report generator
- Task 16: Review-changes command

### Phase 9: Module System
- Task 17: Module registry and loader
- Task 18: Module installation command
- Task 19: Module configuration system

### Phase 10: Optional Modules (Phase 2)
- Task 20: visual-qa module (Playwright + FFmpeg)
- Task 21: dashboard module (Express + React)
- Task 22: design-system module (ESLint + VSCode)
- Task 23: ai-agents module (templates + skills)

### Phase 11: Documentation & Distribution
- Task 24: README with installation instructions
- Task 25: Contributing guide
- Task 26: npm package publishing setup
- Task 27: GitHub Actions CI/CD

---

## Plan Execution

Plan complete and saved to `docs/plans/2026-02-17-starterkit-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
