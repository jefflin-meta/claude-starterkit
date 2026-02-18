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
