---
name: review-changes
description: Re-analyze code with Codex after fixes
---

# Review Changes

Send updated code back to Codex for validation after addressing review findings.

## Usage

```bash
starterkit review-changes
```

## Process

1. Detect code changes since last review
2. Send to Codex with previous findings as context
3. Generate comparison report showing:
   - Original findings
   - Which issues were resolved
   - New issues introduced (if any)
   - Overall quality improvement

## Output

`docs/code-review/YYYY-MM-DD-HHmmss-review.html` with before/after comparison
