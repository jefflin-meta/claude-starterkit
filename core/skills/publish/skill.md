---
name: publish
description: Run comprehensive pre-merge workflow (TDD, code review, security, visual QA, PR creation)
---

# Publish Workflow

Run the full pre-merge validation workflow to ensure code quality before creating a PR.

## Steps

1. **Run Tests** - Execute test suite and verify coverage
2. **Code Review** - Send changes to Codex for analysis
3. **Security Audit** - Run VibeSec + AI-specific checks
4. **Visual QA** - Manual checklist or automated (if visual-qa module installed)
5. **Create PR** - Generate PR with links to all reports

## Usage

```bash
starterkit publish

# Skip specific checks
starterkit publish --skip-visual-qa
starterkit publish --skip-security-audit
```

## Workflow

**This skill orchestrates multiple tools:**

1. Check for uncommitted changes
2. Run test suite (use @superpowers:test-driven-development patterns)
3. Generate test report in `docs/publish/`
4. Send code to Codex for review
5. Generate code review report in `docs/code-review/`
6. If issues found: show copy-able details, wait for fixes
7. Run `/security-audit` skill
8. Run visual QA (manual prompt or automated if module exists)
9. Commit all reports to current branch
10. Create PR with `gh pr create`, linking all reports

## Error Handling

- If tests fail: show errors, don't proceed
- If Codex finds issues: iterate with user
- If security audit fails: show findings, user decides to proceed or fix
- If PR creation fails: show manual `gh` command

## Reports Generated

All reports committed to branch before PR creation:

- `docs/publish/YYYY-MM-DD-HHmmss-<branch>.html`
- `docs/code-review/YYYY-MM-DD-HHmmss-review.html`
- `docs/security/YYYY-MM-DD-HHmmss-audit.html`
- `docs/visual-qa/YYYY-MM-DD-HHmmss-comparison.html` (if module installed)
