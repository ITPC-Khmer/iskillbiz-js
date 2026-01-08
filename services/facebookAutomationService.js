const { FacebookAutomation, FacebookKeyword, FacebookPage, FacebookConversation } = require('../models');
const facebookService = require('./facebookService');

class FacebookAutomationService {
  /**
   * Create an automation rule
   */
  async createAutomation(facebookPageId, automationData) {
    const { name, type, is_active = true, config = {} } = automationData;

    const automation = await FacebookAutomation.create({
      facebook_page_id: facebookPageId,
      name,
      type,
      is_active,
      config
    });

    return automation;
  }

  /**
   * Update an automation rule
   */
  async updateAutomation(automationId, updates) {
    const automation = await FacebookAutomation.findByPk(automationId);
    if (!automation) {
      throw new Error('Automation not found');
    }

    await automation.update(updates);
    return automation;
  }

  /**
   * Delete an automation rule
   */
  async deleteAutomation(automationId) {
    const automation = await FacebookAutomation.findByPk(automationId);
    if (!automation) {
      throw new Error('Automation not found');
    }

    await automation.destroy();
    return { success: true };
  }

  /**
   * Get all automations for a page
   */
  async getAutomations(facebookPageId) {
    return await FacebookAutomation.findAll({
      where: { facebook_page_id: facebookPageId },
      include: [{ model: FacebookKeyword, as: 'keywords' }]
    });
  }

  /**
   * Create a custom keyword
   */
  async createKeyword(automationId, keywordData) {
    const { keyword, match_type = 'contains', response_message, is_active = true } = keywordData;

    const keywordRule = await FacebookKeyword.create({
      facebook_automation_id: automationId,
      keyword,
      match_type,
      response_message,
      is_active
    });

    return keywordRule;
  }

  /**
   * Check if message matches any keywords and respond
   */
  async processKeywords(facebookPageId, message, senderId) {
    const automations = await FacebookAutomation.findAll({
      where: {
        facebook_page_id: facebookPageId,
        type: 'custom_keyword',
        is_active: true
      },
      include: [{
        model: FacebookKeyword,
        as: 'keywords',
        where: { is_active: true }
      }]
    });

    for (const automation of automations) {
      for (const keyword of automation.keywords) {
        if (this.matchKeyword(message, keyword.keyword, keyword.match_type)) {
          // Send response
          await facebookService.sendMessage(facebookPageId, senderId, keyword.response_message);

          // Update stats
          await keyword.increment('match_count');
          await automation.update({
            trigger_count: automation.trigger_count + 1,
            last_triggered_at: new Date()
          });

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Match keyword based on match type
   */
  matchKeyword(message, keyword, matchType) {
    const msg = message.toLowerCase();
    const kw = keyword.toLowerCase();

    switch (matchType) {
      case 'exact':
        return msg === kw;
      case 'contains':
        return msg.includes(kw);
      case 'starts_with':
        return msg.startsWith(kw);
      case 'ends_with':
        return msg.endsWith(kw);
      case 'regex':
        try {
          const regex = new RegExp(kw, 'i');
          return regex.test(message);
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Send away message
   */
  async sendAwayMessage(facebookPageId, senderId) {
    const automation = await FacebookAutomation.findOne({
      where: {
        facebook_page_id: facebookPageId,
        type: 'away_message',
        is_active: true
      }
    });

    if (automation && automation.config?.message) {
      await facebookService.sendMessage(facebookPageId, senderId, automation.config.message);

      await automation.update({
        trigger_count: automation.trigger_count + 1,
        last_triggered_at: new Date()
      });

      return true;
    }

    return false;
  }

  /**
   * Send comment to message (auto-reply to page comments via DM)
   */
  async handleCommentToMessage(facebookPageId, commentData) {
    const automation = await FacebookAutomation.findOne({
      where: {
        facebook_page_id: facebookPageId,
        type: 'comment_to_message',
        is_active: true
      }
    });

    if (automation && automation.config?.message) {
      const senderId = commentData.from.id;
      await facebookService.sendMessage(facebookPageId, senderId, automation.config.message);

      await automation.update({
        trigger_count: automation.trigger_count + 1,
        last_triggered_at: new Date()
      });

      return true;
    }

    return false;
  }

  /**
   * Check for unanswered messages and send alerts
   */
  async checkUnansweredMessages(facebookPageId) {
    const automation = await FacebookAutomation.findOne({
      where: {
        facebook_page_id: facebookPageId,
        type: 'unanswered_alert',
        is_active: true
      }
    });

    if (!automation) {
      return [];
    }

    const hoursThreshold = automation.config?.hours_threshold || 24;
    const unanswered = await facebookService.getUnansweredConversations(facebookPageId, hoursThreshold);

    if (unanswered.length > 0) {
      await automation.update({
        trigger_count: automation.trigger_count + 1,
        last_triggered_at: new Date()
      });
    }

    return unanswered;
  }

  /**
   * Request contact information from user
   */
  async requestContactInfo(facebookPageId, senderId, fields = ['email', 'phone']) {
    const automation = await FacebookAutomation.findOne({
      where: {
        facebook_page_id: facebookPageId,
        type: 'contact_info',
        is_active: true
      }
    });

    if (automation) {
      const message = automation.config?.message ||
        `Thank you for contacting us! Could you please provide your ${fields.join(' and ')} so we can assist you better?`;

      await facebookService.sendMessage(facebookPageId, senderId, message);

      await automation.update({
        trigger_count: automation.trigger_count + 1,
        last_triggered_at: new Date()
      });

      return true;
    }

    return false;
  }
}

module.exports = new FacebookAutomationService();

