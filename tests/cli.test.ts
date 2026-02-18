import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execAsync = promisify(exec);
const cliPath = resolve(__dirname, '../dist/cli.js');

describe('CLI Commands', () => {
  it('should show version with --version flag', async () => {
    const { stdout } = await execAsync(`node "${cliPath}" --version`);
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should show help with --help flag', async () => {
    const { stdout } = await execAsync(`node "${cliPath}" --help`);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('init');
    expect(stdout).toContain('publish');
  });
});
