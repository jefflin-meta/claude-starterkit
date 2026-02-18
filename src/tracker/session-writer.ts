import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { Session } from './types';
import { generateSessionHTML } from './html-generator';

const MAX_TOPIC_LENGTH = 100;

function sanitizeTopic(topic: string): string {
  const sanitized = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Fallback to 'untitled' if topic is empty after sanitization
  if (!sanitized) {
    return 'untitled';
  }

  // Limit length to prevent filesystem issues
  return sanitized.substring(0, MAX_TOPIC_LENGTH);
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

export function writeSession(session: Session, topic: string): string {
  try {
    const html = generateSessionHTML(session);
    const filename = generateFilename(session.timestamp, topic);
    const filePath = resolve(process.cwd(), 'docs/ai-sessions', filename);

    // Ensure directory exists before writing
    mkdirSync(dirname(filePath), { recursive: true });

    writeFileSync(filePath, html, 'utf-8');

    return filePath;
  } catch (error: any) {
    throw new Error(`Failed to write session file: ${error.message}`);
  }
}
