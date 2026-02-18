---
name: security-audit
description: Run VibeSec-Skill plus AI-specific security checks
---

# Security Audit

Comprehensive security scanning with AI-specific vulnerability detection.

## Checks

**VibeSec-Skill (imported):**
- General security best practices
- OWASP vulnerabilities
- Dependency scanning

**AI-Specific:**
- Prompt injection vulnerabilities
- PII in prompts/training data
- API key exposure in code/session logs
- Model access control validation
- Data leakage through outputs
- Unsafe deserialization

## Usage

```bash
starterkit security-audit
```

## Output

Interactive HTML report: `docs/security/YYYY-MM-DD-HHmmss-audit.html`

**Report sections:**
- Executive summary with severity counts
- VibeSec findings
- AI-specific findings
- Code snippets with vulnerabilities highlighted
- Copy-able remediation suggestions
- Compliance checklist
