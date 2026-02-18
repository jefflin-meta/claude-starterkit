# Starterkit

Claude CLI plugin for small AI development teams.

## Installation

### Via Claude CLI Plugin Marketplace (Recommended)

```bash
# Add the starterkit marketplace
claude plugin marketplace add jefflin-meta/claude-starterkit

# Install the plugin
claude plugin install starterkit
# Note: "(no content)" means installation succeeded
```

**⚠️ IMPORTANT: Restart Required**

After installation, you MUST restart your Claude session:
```bash
# Exit current session (Ctrl+C or Ctrl+D), then:
claude
```

Skills will NOT work until you restart!

### From GitHub (for development)

```bash
npm install -g git+https://github.com/jefflin-meta/claude-starterkit.git
```

### From npm (once published)

```bash
npm install -g starterkit
```

## Usage

After installation, restart your Claude CLI session to access the new skills.

Initialize starterkit in your project:

```bash
starterkit init
```

Or use the interactive onboarding skill in Claude CLI:

```bash
/onboard
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
