import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, existsSync, mkdtempSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';
import simpleGit from 'simple-git';
import {
  getCurrentBranch,
  getModifiedFiles,
  commitSessionReport,
  isGitRepo
} from '../../src/git/operations';

describe('Git Operations', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();

    // Create unique temp directory for each test
    testDir = mkdtempSync(join(tmpdir(), 'git-test-'));
    process.chdir(testDir);

    const git = simpleGit(testDir);
    await git.init();
    await git.addConfig('user.name', 'Test User');
    await git.addConfig('user.email', 'test@example.com');
    // Set initial branch name explicitly
    await git.raw(['branch', '-M', 'main']);

    writeFileSync('README.md', '# Test');
    await git.add('README.md');
    await git.commit('Initial commit');
  });

  afterEach(() => {
    // Always restore working directory first
    process.chdir(originalCwd);

    // Clean up temp directory
    if (testDir && existsSync(testDir)) {
      try {
        rmSync(testDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      } catch (err) {
        // On Windows, git may have file locks - ignore cleanup errors
        console.warn('Could not clean up test directory:', err);
      }
    }
  });

  it('should detect git repository', async () => {
    expect(await isGitRepo()).toBe(true);
  });

  it('should get current branch', async () => {
    const branch = await getCurrentBranch();
    expect(branch).toBe('main');
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
