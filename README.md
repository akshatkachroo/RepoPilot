# GitHub Workflow Helper

A Node.js CLI tool and webhook server to help software teams manage GitHub issues and pull requests with automation. Perfect for open source projects and team collaboration.

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/yourusername/gh-workflow-helper.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the CLI:
```bash
npm start list-issues  # List all open issues
```

## CLI Commands

### List Issues
```bash
# List all open issues
npm start list-issues

# Filter by labels
npm start list-issues --labels bug,enhancement

# Show only stale issues
npm start list-issues --stale
```

### Create Issues
```bash
npm start create-issue --title "Bug: Login not working" --body "Steps to reproduce..." --labels bug,high-priority
```

### List Pull Requests
```bash
npm start list-prs
```

### Assign Reviewers
```bash
npm start assign-reviewers --pr 123 --reviewers user1,user2
```
