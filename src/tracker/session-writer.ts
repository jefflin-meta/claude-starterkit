import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { Session } from './types';
import { generateSessionHTML } from './html-generator';

function sanitizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateFilename(timestamp: string, topic: string): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const sanitized = sanitizeTopic(topic);
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}-${sanitized}.html`;
}

export async function writeSession(session: Session, topic: string): Promise<string> {
  const html = generateSessionHTML(session);
  const filename = generateFilename(session.timestamp, topic);
  const filePath = resolve(process.cwd(), 'docs/ai-sessions', filename);

  writeFileSync(filePath, html, 'utf-8');

  return filePath;
}
