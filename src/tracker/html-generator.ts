import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Session, SubAgent } from './types';

// Register partial for recursive sub-agents
Handlebars.registerPartial('subAgentPartial', `
  <details class="sub-agent {{#if subAgents}}sub-agent-nested{{/if}}" open>
    <summary><strong>{{type}}:</strong> {{task}}</summary>
    <p>{{results}}</p>
    <button class="copy-btn" data-copy-text="{{task}}\n{{results}}">Copy</button>
    {{#if subAgents}}
      {{#each subAgents}}
        {{> subAgentPartial this}}
      {{/each}}
    {{/if}}
  </details>
`);

let templateCache: HandlebarsTemplateDelegate<Session> | null = null;

function getTemplate(): HandlebarsTemplateDelegate<Session> {
  if (!templateCache) {
    try {
      const templatePath = resolve(__dirname, 'templates/session-report.hbs');
      const templateSource = readFileSync(templatePath, 'utf-8');
      templateCache = Handlebars.compile(templateSource);
    } catch (error: any) {
      throw new Error(`Failed to load session report template: ${error.message}`);
    }
  }
  return templateCache;
}

export function generateSessionHTML(session: Session): string {
  const template = getTemplate();
  return template(session);
}
