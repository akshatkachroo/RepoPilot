const { Command } = require('commander');
const chalk = require('chalk');
const GitHubAPI = require('./github');

class CLI {
  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('gh-workflow-helper')
      .description('GitHub workflow automation tool')
      .version('1.0.0');

    this.program
      .command('create-issue')
      .description('Create a new issue')
      .requiredOption('-t, --title <title>', 'Issue title')
      .requiredOption('-b, --body <body>', 'Issue description')
      .option('-l, --labels <labels>', 'Comma-separated list of labels')
      .action(async (options) => {
        try {
          const labels = options.labels ? options.labels.split(',') : [];
          const issue = await this.github.createIssue(options.title, options.body, labels);
          console.log(chalk.green('\nIssue created successfully:'));
          console.log(chalk.cyan(`\n#${issue.number}: ${issue.title}`));
          console.log(`URL: ${issue.html_url}`);
          if (issue.labels.length > 0) {
            console.log('Labels:', issue.labels.map(l => l.name).join(', '));
          }
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      });

    this.program
      .command('list-issues')
      .description('List open issues')
      .option('-l, --labels <labels>', 'Filter by labels (comma-separated)')
      .option('-s, --stale', 'Show only stale issues (no updates in 30+ days)')
      .action(async (options) => {
        try {
          const labels = options.labels ? options.labels.split(',') : [];
          const issues = await this.github.getOpenIssues(labels, options.stale);
          
          console.log(chalk.bold('\nOpen Issues:'));
          issues.forEach(issue => {
            console.log(chalk.cyan(`\n#${issue.number}: ${issue.title}`));
            console.log(`URL: ${issue.html_url}`);
            console.log(`Created: ${new Date(issue.created_at).toLocaleDateString()}`);
            console.log(`Updated: ${new Date(issue.updated_at).toLocaleDateString()}`);
            if (issue.labels.length > 0) {
              console.log('Labels:', issue.labels.map(l => l.name).join(', '));
            }
          });
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      });

    this.program
      .command('list-prs')
      .description('List open pull requests')
      .action(async () => {
        try {
          const prs = await this.github.getOpenPRs();
          
          console.log(chalk.bold('\nOpen Pull Requests:'));
          prs.forEach(pr => {
            console.log(chalk.cyan(`\n#${pr.number}: ${pr.title}`));
            console.log(`Author: ${pr.user.login}`);
            console.log(`URL: ${pr.html_url}`);
            console.log(`Created: ${new Date(pr.created_at).toLocaleDateString()}`);
            console.log(`Updated: ${new Date(pr.updated_at).toLocaleDateString()}`);
            if (pr.labels.length > 0) {
              console.log('Labels:', pr.labels.map(l => l.name).join(', '));
            }
          });
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      });

    this.program
      .command('assign-reviewers')
      .description('Assign reviewers to a pull request')
      .requiredOption('-p, --pr <number>', 'Pull request number')
      .requiredOption('-r, --reviewers <reviewers>', 'Comma-separated list of reviewers')
      .action(async (options) => {
        try {
          const reviewers = options.reviewers.split(',');
          await this.github.assignReviewers(options.pr, reviewers);
          console.log(chalk.green(`Successfully assigned reviewers to PR #${options.pr}`));
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
          process.exit(1);
        }
      });
  }

  initialize(githubToken, owner, repo) {
    this.github = new GitHubAPI(githubToken, owner, repo);
  }

  parse() {
    this.program.parse();
  }
}

module.exports = CLI; 