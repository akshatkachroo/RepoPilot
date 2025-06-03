#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const CLI = require('./cli');
const WebhookServer = require('./webhook');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n❌ No .env file found!');
  console.log('\nTo get started:');
  console.log('1. Run "npm run setup" to configure the tool');
  console.log('2. Follow the setup wizard to enter your GitHub credentials');
  console.log('\nFor more information, see the README.md file');
  process.exit(1);
}

// Check required environment variables
const requiredEnvVars = [
  'GITHUB_TOKEN',
  'GITHUB_OWNER',
  'GITHUB_REPO',
  'WEBHOOK_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.log('\n❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.log(`- ${varName}`));
  console.log('\nPlease run "npm run setup" to configure the tool');
  process.exit(1);
}

// Initialize CLI
const cli = new CLI();
cli.initialize(
  process.env.GITHUB_TOKEN,
  process.env.GITHUB_OWNER,
  process.env.GITHUB_REPO
);

// If no command is provided, start the webhook server
if (process.argv.length <= 2) {
  const reviewers = process.env.REVIEWERS ? process.env.REVIEWERS.split(',') : [];
  const webhookServer = new WebhookServer(
    parseInt(process.env.WEBHOOK_PORT || '3000'),
    process.env.WEBHOOK_SECRET,
    process.env.GITHUB_TOKEN,
    process.env.GITHUB_OWNER,
    process.env.GITHUB_REPO,
    process.env.SLACK_WEBHOOK_URL,
    reviewers
  );
  webhookServer.start();
} else {
  // Parse CLI commands
  cli.parse();
} 