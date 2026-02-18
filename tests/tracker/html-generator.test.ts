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

  it('should escape special characters to prevent XSS', () => {
    const maliciousSession: Session = {
      id: 'session-xss',
      timestamp: '2026-02-17T14:30:22Z',
      user: 'test-user',
      branch: 'main',
      mainPrompt: '<script>alert("XSS")</script>',
      filesModified: ['file.ts'],
      subAgents: [
        {
          type: 'Explore',
          task: '"); alert("XSS");//',
          results: '<img src=x onerror=alert(1)>'
        }
      ],
      codeChanges: []
    };

    const html = generateSessionHTML(maliciousSession);

    // Should not contain executable script tags
    expect(html).not.toContain('<script>alert("XSS")</script>');
    // Should escape HTML entities
    expect(html).toContain('&lt;script&gt;');
    // Should not have inline onclick with user input
    expect(html).not.toMatch(/onclick=["'].*alert/);
  });
});
