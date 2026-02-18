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
