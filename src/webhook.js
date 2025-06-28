const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const GitHubAPI = require('./github');
const GeminiAI = require('./gemini');

class WebhookServer {
  constructor(port, webhookSecret, githubToken, owner, repo, slackWebhookUrl, reviewers, geminiApiKey) {
    this.port = port;
    this.webhookSecret = webhookSecret;
    this.github = new GitHubAPI(githubToken, owner, repo);
    this.slackWebhookUrl = slackWebhookUrl;
    console.log('Slack webhook URL configured:', this.slackWebhookUrl ? 'Yes' : 'No');
    this.reviewers = reviewers;
    this.currentReviewerIndex = 0;
    this.gemini = new GeminiAI(geminiApiKey);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log('Received webhook request:', {
        headers: req.headers,
        body: req.body
      });
      
      const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
      if (!signature) {
        console.log('No signature provided in headers');
        return res.status(401).json({ error: 'No signature provided' });
      }

      const hmac = crypto.createHmac('sha256', this.webhookSecret);
      const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
      const checksum = `sha256=${digest}`;

      if (signature !== checksum) {
        console.log('Signature mismatch:', { received: signature, calculated: checksum });
        return res.status(401).json({ error: 'Invalid signature' });
      }
      next();
    });
  }

  setupRoutes() {
    this.app.post('/webhook', async (req, res) => {
      const event = req.headers['x-github-event'];
      const payload = req.body;
      console.log('Processing webhook event:', event);

      try {
        switch (event) {
          case 'issues':
            console.log('Handling issues event:', payload.action);
            await this.handleIssuesEvent(payload);
            break;
          case 'pull_request':
            console.log('Handling pull request event:', payload.action);
            await this.handlePullRequestEvent(payload);
            break;
          case 'issue_comment':
            console.log('Handling issue comment event:', payload.action);
            await this.handleIssueCommentEvent(payload);
            break;
          default:
            console.log('Unhandled event type:', event);
        }
        res.status(200).json({ message: 'Webhook processed successfully' });
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  async handleIssuesEvent(payload) {
    if (payload.action === 'opened') {
      const reviewer = this.getNextReviewer();
      await this.github.assignIssue(payload.issue.number, reviewer);
    }
  }

  async handlePullRequestEvent(payload) {
    console.log('Pull request event received:', {
      action: payload.action,
      merged: payload.pull_request?.merged,
      number: payload.pull_request?.number
    });

    if (payload.action === 'opened') {
      const reviewer = this.getNextReviewer();
      await this.github.assignReviewers(payload.pull_request.number, [reviewer]);
      await this.github.addLabel(payload.pull_request.number, 'needs-review');
    } else if (payload.action === 'closed' && payload.pull_request.merged) {
      console.log('PR was merged, attempting to send Slack notification');
      await this.notifySlack(payload.pull_request);
    }
  }

  async handleIssueCommentEvent(payload) {
    if (payload.action === 'created') {
      const comment = payload.comment.body.toLowerCase();
      if (comment.includes('/assign me')) {
        await this.github.assignIssue(payload.issue.number, payload.comment.user.login);
      }
    }
  }

  getNextReviewer() {
    const reviewer = this.reviewers[this.currentReviewerIndex];
    this.currentReviewerIndex = (this.currentReviewerIndex + 1) % this.reviewers.length;
    return reviewer;
  }

  async notifySlack(pr) {
    console.log('Attempting to send Slack notification for PR:', {
      number: pr.number,
      title: pr.title,
      author: pr.user.login,
      url: pr.html_url,
      webhookUrl: this.slackWebhookUrl ? 'Configured' : 'Not configured'
    });

    if (!this.slackWebhookUrl) {
      console.log('No Slack webhook URL configured');
      return;
    }

    // Generate AI summary
    let aiSummary = '';
    try {
      const prData = {
        title: pr.title,
        body: pr.body,
        changed_files: pr.changed_files,
        additions: pr.additions,
        deletions: pr.deletions
      };
      
      aiSummary = await this.gemini.generatePRSummary(prData);
      if (aiSummary) {
        console.log('Generated AI summary:', aiSummary);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
    }

    const message = {
      text: `🎉 PR #${pr.number} "${pr.title}" has been merged!\nAuthor: ${pr.user.login}\nURL: ${pr.html_url}${aiSummary ? `\n\n🤖 AI Summary:\n${aiSummary}` : ''}`
    };

    try {
      console.log('Sending Slack notification with payload:', JSON.stringify(message, null, 2));
      const response = await axios.post(this.slackWebhookUrl, message);
      console.log('Slack notification response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    } catch (error) {
      console.error('Error sending Slack notification:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Webhook server listening on port ${this.port}`);
    });
  }
}

module.exports = WebhookServer; 