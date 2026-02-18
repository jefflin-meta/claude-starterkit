export interface SubAgent {
  type: 'Explore' | 'Plan' | 'general-purpose' | 'Bash' | string;
  task: string;
  results: string;
  subAgents?: SubAgent[]; // Nested sub-agents
}

export interface CodeChange {
  file: string;
  additions: number;
  deletions: number;
  diff?: string;
}

export interface Session {
  id: string;
  timestamp: string;
  user: string;
  branch: string;
  mainPrompt: string;
  filesModified: string[];
  subAgents: SubAgent[];
  codeChanges: CodeChange[];
  incomplete?: boolean;
}

export function validateSession(session: Session): boolean {
  return !!(
    session.id &&
    session.timestamp &&
    session.user &&
    session.mainPrompt &&
    Array.isArray(session.filesModified) &&
    Array.isArray(session.subAgents) &&
    Array.isArray(session.codeChanges)
  );
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
