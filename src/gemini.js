const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
  constructor(apiKey) {
    if (!apiKey) {
      console.warn('No Gemini API key provided. AI summaries will be disabled.');
      this.enabled = false;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.enabled = true;
  }

  async generatePRSummary(prData) {
    if (!this.enabled) {
      return null;
    }

    try {
      const prompt = `Generate a concise summary of what this PR accomplished and its potential impact on the codebase. Keep it simple and under 100 words.

PR Title: ${prData.title}
PR Description: ${prData.body || 'No description provided'}
Files Changed: ${prData.changed_files || 'Unknown'}
Additions: ${prData.additions || 'Unknown'}
Deletions: ${prData.deletions || 'Unknown'}

Please provide a brief, professional summary focusing on the key changes and their impact.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating PR summary with Gemini AI:', error);
      return null;
    }
  }
}

module.exports = GeminiAI; 