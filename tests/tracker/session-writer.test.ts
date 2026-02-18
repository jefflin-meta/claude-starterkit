import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeSession } from '../../src/tracker/session-writer';
import { Session } from '../../src/tracker/types';

describe('Session Writer', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    testDir = mkdtempSync(join(tmpdir(), 'starterkit-test-'));
    mkdirSync(join(testDir, 'docs/ai-sessions'), { recursive: true });
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
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
    expect(filePath).toMatch(/docs[/\\]ai-sessions[/\\]\d{4}-\d{2}-\d{2}-\d{6}-test-topic\.html$/);
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

  it('should handle empty and invalid topic names', async () => {
    const session: Session = {
      id: 'session-125',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'main',
      mainPrompt: 'Test',
      filesModified: [],
      subAgents: [],
      codeChanges: []
    };

    // Empty topic
    const emptyPath = await writeSession(session, '');
    expect(emptyPath).toMatch(/untitled\.html$/);
    expect(existsSync(emptyPath)).toBe(true);

    // Only special characters
    const specialPath = await writeSession(session, '!!!@@@###');
    expect(specialPath).toMatch(/untitled\.html$/);
    expect(existsSync(specialPath)).toBe(true);

    // Whitespace only
    const whitespacePath = await writeSession(session, '   ');
    expect(whitespacePath).toMatch(/untitled\.html$/);
    expect(existsSync(whitespacePath)).toBe(true);
  });
});
