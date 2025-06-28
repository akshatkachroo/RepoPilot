const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  {
    name: 'githubToken',
    message: 'Enter your GitHub Personal Access Token: ',
    validate: (input) => input.length > 0,
    required: true
  },
  {
    name: 'githubOwner',
    message: 'Enter your GitHub username or organization name: ',
    validate: (input) => input.length > 0,
    required: true
  },
  {
    name: 'githubRepo',
    message: 'Enter your repository name: ',
    validate: (input) => input.length > 0,
    required: true
  },
  {
    name: 'webhookPort',
    message: 'Enter webhook server port (default: 3000): ',
    validate: (input) => !input || /^\d+$/.test(input),
    required: false,
    default: '3000'
  },
  {
    name: 'reviewers',
    message: 'Enter comma-separated list of GitHub usernames for reviewers (optional): ',
    validate: (input) => true,
    required: false
  },
  {
    name: 'slackWebhookUrl',
    message: 'Enter Slack webhook URL for PR merge notifications (optional): ',
    validate: (input) => true,
    required: false
  },
  {
    name: 'geminiApiKey',
    message: 'Enter your Google Gemini API key for AI-powered PR summaries (optional): ',
    validate: (input) => true,
    required: false
  }
];

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.message, (answer) => {
      if (!answer && !question.required) {
        resolve(question.default || '');
      } else if (question.validate(answer)) {
        resolve(answer);
      } else {
        console.log('Invalid input. Please try again.');
        resolve(askQuestion(question));
      }
    });
  });
}

async function setup() {
  console.log('Welcome to GitHub Workflow Helper Setup!');
  console.log('This will help you configure the tool for your GitHub repository.\n');

  const answers = {};
  for (const question of questions) {
    answers[question.name] = await askQuestion(question);
  }

  // Generate a random webhook secret
  const webhookSecret = crypto.randomBytes(32).toString('hex');

  // Create .env file
  const envContent = `# Required
GITHUB_TOKEN=${answers.githubToken}
GITHUB_OWNER=${answers.githubOwner}
GITHUB_REPO=${answers.githubRepo}
WEBHOOK_SECRET=${webhookSecret}

# Optional
WEBHOOK_PORT=${answers.webhookPort}
${answers.reviewers ? `REVIEWERS=${answers.reviewers}  # Comma-separated list of GitHub usernames` : ''}
${answers.slackWebhookUrl ? `SLACK_WEBHOOK_URL=${answers.slackWebhookUrl}  # For PR merge notifications` : ''}
${answers.geminiApiKey ? `GEMINI_API_KEY=${answers.geminiApiKey}  # For AI-powered PR summaries` : ''}
`;

  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);

  console.log('\n✅ Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run "npm start list-issues" to test your configuration');
  console.log('2. Set up the webhook in your GitHub repository settings:');
  console.log('   - Go to Settings > Webhooks > Add webhook');
  console.log('   - Set Payload URL to: http://your-server:3000/webhook');
  console.log('   - Set Secret to the generated webhook secret');
  console.log('   - Select events: Issues, Pull requests, Issue comments');
  
  if (answers.reviewers) {
    console.log('\nReviewers configured:');
    console.log(answers.reviewers.split(',').map(r => `- ${r.trim()}`).join('\n'));
  }
  
  if (answers.slackWebhookUrl) {
    console.log('\n✅ Slack notifications enabled for PR merges');
  }

  if (answers.geminiApiKey) {
    console.log('\n✅ AI-powered PR summaries enabled with Google Gemini');
  }

  rl.close();
}

setup().catch(console.error); 