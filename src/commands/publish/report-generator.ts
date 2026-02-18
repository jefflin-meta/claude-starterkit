import Handlebars from 'handlebars';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export interface PublishReport {
  branch: string;
  timestamp: string;
  testsPassed: boolean;
  testsOutput: string;
  codeReviewPassed: boolean;
  codeReviewReport: string | null;
  securityAuditPassed: boolean;
  securityReport: string | null;
  visualQAPassed: boolean;
  visualQAReport: string | null;
  prUrl: string | null;
}

let templateCache: HandlebarsTemplateDelegate<PublishReport> | null = null;

function getTemplate(): HandlebarsTemplateDelegate<PublishReport> {
  if (!templateCache) {
    const templatePath = resolve(__dirname, 'templates/publish-report.hbs');
    const templateSource = readFileSync(templatePath, 'utf-8');
    templateCache = Handlebars.compile(templateSource);
  }
  return templateCache;
}

export function generatePublishReport(report: PublishReport): string {
  const template = getTemplate();
  return template(report);
}

export function savePublishReport(report: PublishReport): string {
  const html = generatePublishReport(report);

  const date = new Date(report.timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const branch = report.branch.replace(/[^a-z0-9]+/gi, '-');
  const filename = `${year}-${month}-${day}-${hours}${minutes}${seconds}-${branch}.html`;
  const filePath = resolve(process.cwd(), 'docs/publish', filename);

  writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
