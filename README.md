# GitHub Workflow Helper

A Node.js CLI tool and webhook server to help software teams manage GitHub issues and pull requests with automation. Perfect for open source projects and team collaboration.

## Quick Start

1. Clone this repository:
```bash
git clone https://github.com/yourusername/gh-workflow-helper.git
cd gh-workflow-helper
```

2. Install dependencies:
```bash
npm install
```

3. Create a GitHub Personal Access Token:
   - Go to GitHub Settings > Developer Settings > Personal Access Tokens > Tokens (classic)
   - Click "Generate new token"
   - Select scopes: `repo`, `workflow`
   - Copy the generated token

4. Create a `.env` file in the project root:
```env
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username_or_org
GITHUB_REPO=your_repository_name
WEBHOOK_SECRET=any_random_string_for_security
```

5. Run the CLI:
```bash
npm start list-issues  # List all open issues
```

## Features

- 📝 Create and manage GitHub issues from the command line
- 🔄 Automatic reviewer assignment
- 📊 List and filter issues and pull requests
- 🔔 Slack notifications for merged PRs
- 🤖 Command parsing in issue comments
- 🌐 Webhook server for GitHub events

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

## GitHub Webhook Setup

1. Go to your GitHub repository settings
2. Navigate to Webhooks > Add webhook
3. Set the Payload URL to `http://your-server:3000/webhook`
4. Set Content type to `application/json`
5. Set Secret to match your `WEBHOOK_SECRET`
6. Select events:
   - Issues
   - Pull requests
   - Issue comments
7. Click "Add webhook"

## Issue Comment Commands

The webhook server supports these commands in issue comments:
- `/assign me` - Assigns the issue to the commenter
- `/label bug` - Adds the "bug" label
- `/unlabel bug` - Removes the "bug" label

## Automatic Actions

The webhook server automatically:
1. Assigns reviewers to new issues and PRs using round-robin selection
2. Adds "needs-review" label to new PRs
3. Sends Slack notifications when PRs are merged

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file with required variables
4. Run the development server:
   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 