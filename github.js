const axios = require('axios');
const chalk = require('chalk');

class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  async getOpenIssues(labels = [], stale = false) {
    try {
      const response = await this.api.get(`/repos/${this.owner}/${this.repo}/issues`, {
        params: {
          state: 'open',
          labels: labels.join(','),
          sort: 'updated',
          direction: 'desc'
        }
      });

      let issues = response.data;
      if (stale) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        issues = issues.filter(issue => new Date(issue.updated_at) < thirtyDaysAgo);
      }

      return issues;
    } catch (error) {
      console.error(chalk.red('Error fetching issues:'), error.message);
      throw error;
    }
  }

  async getOpenPRs() {
    try {
      const response = await this.api.get(`/repos/${this.owner}/${this.repo}/pulls`, {
        params: {
          state: 'open',
          sort: 'updated',
          direction: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error(chalk.red('Error fetching PRs:'), error.message);
      throw error;
    }
  }

  async assignReviewers(prNumber, reviewers) {
    try {
      await this.api.post(`/repos/${this.owner}/${this.repo}/pulls/${prNumber}/requested_reviewers`, {
        reviewers
      });
      return true;
    } catch (error) {
      console.error(chalk.red('Error assigning reviewers:'), error.message);
      throw error;
    }
  }

  async addLabel(prNumber, label) {
    try {
      await this.api.post(`/repos/${this.owner}/${this.repo}/issues/${prNumber}/labels`, {
        labels: [label]
      });
      return true;
    } catch (error) {
      console.error(chalk.red('Error adding label:'), error.message);
      throw error;
    }
  }

  async assignIssue(issueNumber, assignee) {
    try {
      await this.api.post(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}/assignees`, {
        assignees: [assignee]
      });
      return true;
    } catch (error) {
      console.error(chalk.red('Error assigning issue:'), error.message);
      throw error;
    }
  }

  async createIssue(title, body, labels = []) {
    try {
      const response = await this.api.post(`/repos/${this.owner}/${this.repo}/issues`, {
        title,
        body,
        labels
      });
      return response.data;
    } catch (error) {
      console.error(chalk.red('Error creating issue:'), error.message);
      throw error;
    }
  }
}

module.exports = GitHubAPI; 