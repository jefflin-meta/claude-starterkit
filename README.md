# Starterkit

Claude CLI plugin for small AI development teams.

## Installation

### From GitHub (for testing)

```bash
npm install -g git+https://github.com/jefflin-meta/claude-starterkit.git
```

### From npm (once published)

```bash
npm install -g starterkit
```

## Usage

Initialize starterkit in your project:

```bash
starterkit init
```

## Available Commands

- `starterkit init` - Initialize starterkit in current project
- `starterkit --version` - Show version
- `starterkit --help` - Show help

## Features

- **AI Session Tracking** - Captures prompts, sub-agent work, and outputs as browsable HTML reports
- **`/publish` Workflow** - Orchestrates TDD → Code review → Security audit → Visual QA → PR creation
- **Security Audit** - AI-specific vulnerability scanning
- **Curated Skills Bundle** - Best practices from superpowers and custom workflows

## License

MIT
