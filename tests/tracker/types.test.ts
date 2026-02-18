import { describe, it, expect } from 'vitest';
import { Session, SubAgent, validateSession, generateSessionId } from '../../src/tracker/types';

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

  it('should generate unique session IDs', () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^session-\d+-[a-z0-9]+$/);
  });

  it('should reject invalid session objects', () => {
    expect(validateSession(null as any)).toBe(false);
    expect(validateSession(undefined as any)).toBe(false);
    expect(validateSession({} as any)).toBe(false);

    const invalidSession = {
      id: '',
      timestamp: new Date().toISOString(),
      user: 'test',
      branch: 'main',
      mainPrompt: 'test',
      filesModified: [],
      subAgents: [],
      codeChanges: []
    };
    expect(validateSession(invalidSession)).toBe(false);
  });
});
