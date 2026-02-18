import { describe, it, expect } from 'vitest';
import { generatePublishReport, PublishReport } from '../../../src/commands/publish/report-generator';

describe('Publish Report Generator', () => {
  it('should generate HTML report with all sections', () => {
    const report: PublishReport = {
      branch: 'feature/test',
      timestamp: '2026-02-17T14:30:22Z',
      testsPassed: true,
      testsOutput: 'All tests passed',
      codeReviewPassed: true,
      codeReviewReport: 'docs/code-review/2026-02-17-143022-review.html',
      securityAuditPassed: true,
      securityReport: 'docs/security/2026-02-17-143022-audit.html',
      visualQAPassed: true,
      visualQAReport: null,
      prUrl: null
    };

    const html = generatePublishReport(report);

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('feature/test');
    expect(html).toContain('Tests');
    expect(html).toContain('Code Review');
    expect(html).toContain('Security Audit');
  });

  it('should show failures in red', () => {
    const report: PublishReport = {
      branch: 'feature/fail',
      timestamp: '2026-02-17T14:30:22Z',
      testsPassed: false,
      testsOutput: 'Tests failed',
      codeReviewPassed: false,
      codeReviewReport: null,
      securityAuditPassed: true,
      securityReport: 'docs/security/report.html',
      visualQAPassed: true,
      visualQAReport: null,
      prUrl: null
    };

    const html = generatePublishReport(report);

    expect(html).toContain('fail');
    expect(html).toContain('Tests failed');
  });

  it('should prevent XSS in data attributes', () => {
    const report: PublishReport = {
      branch: 'feature/test',
      timestamp: '2026-02-17T14:30:22Z',
      testsPassed: false,
      testsOutput: 'Error with "quotes" and \'apostrophes\' and <script>alert("xss")</script>',
      codeReviewPassed: true,
      codeReviewReport: null,
      securityAuditPassed: true,
      securityReport: null,
      visualQAPassed: true,
      visualQAReport: null,
      prUrl: null
    };

    const html = generatePublishReport(report);

    // Verify quotes are escaped in data attribute
    expect(html).not.toContain('data-copy-text="Error with "quotes"');
    // Verify script tags are escaped
    expect(html).not.toContain('<script>alert("xss")</script>');
    // Verify the content is present but escaped
    expect(html).toContain('Error with');

    // Verify Handlebars properly escapes HTML entities
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;quotes&quot;');
    expect(html).toContain('&#x27;apostrophes&#x27;');
  });
});
