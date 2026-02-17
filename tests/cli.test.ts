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
