import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { runTests, TestResult } from '../../../src/commands/publish/test-runner';

describe('Test Runner', () => {
  const testDir = join(tmpdir(), 'test-runner-' + Date.now() + '-' + Math.random().toString(36).substring(7));
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);

    // Create package.json with test script
    writeFileSync('package.json', JSON.stringify({
      scripts: { test: 'echo "PASS"' }
    }));
  });

  afterEach(() => {
    process.chdir(originalCwd);
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
