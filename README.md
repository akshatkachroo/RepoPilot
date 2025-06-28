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

4. (Optional) Create a Google Gemini API key for AI-powered PR summaries:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the generated key

5. Run the setup wizard:
```bash
npm run setup
```

6. Run the CLI:
```bash
npm start list-issues  # List all open issues
```

## Features

- 📝 Create and manage GitHub issues from the command line
- 🔄 Automatic reviewer assignment
- 📊 List and filter issues and pull requests
- 🔔 Slack notifications for merged PRs with AI-powered summaries
- 🤖 Command parsing in issue comments
- 🌐 Webhook server for GitHub events
- 🧠 Google Gemini AI integration for intelligent PR analysis

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
4. **NEW**: Generates AI-powered summaries of merged PRs using Google Gemini

## AI-Powered PR Summaries

When a pull request is merged, the system can automatically generate a concise summary using Google Gemini AI. The summary includes:
- What the PR accomplished
- Potential impact on the codebase
- Key changes and their significance

To enable this feature:
1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY=your_api_key` to your `.env` file
3. The AI summary will be included in Slack notifications

Example Slack notification with AI summary:
```
🎉 PR #123 "Add user authentication" has been merged!
Author: john_doe
URL: https://github.com/org/repo/pull/123

🤖 AI Summary:
This PR implements user authentication using JWT tokens. It adds login/logout functionality, 
password hashing, and session management. The changes improve security and user experience 
by providing proper authentication flow.
```

## Environment Variables

Required:
- `GITHUB_TOKEN` - Your GitHub Personal Access Token
- `GITHUB_OWNER` - Your GitHub username or organization
- `GITHUB_REPO` - Your repository name
- `WEBHOOK_SECRET` - Secret for webhook verification

Optional:
- `WEBHOOK_PORT` - Port for webhook server (default: 3000)
- `REVIEWERS` - Comma-separated list of GitHub usernames for automatic assignment
- `SLACK_WEBHOOK_URL` - Slack webhook URL for PR merge notifications
- `GEMINI_API_KEY` - Google Gemini API key for AI-powered PR summaries

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the setup wizard:
   ```bash
   npm run setup
   ```
4. Run the development server:
   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 

