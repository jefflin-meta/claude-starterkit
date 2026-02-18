import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, readFileSync, mkdtempSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';
import { initCommand } from '../../src/commands/init';

describe('Init Command', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'starterkit-test-'));
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
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
