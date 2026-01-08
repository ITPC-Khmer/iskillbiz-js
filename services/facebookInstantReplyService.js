const { FacebookInstantReply, FacebookAutomation } = require('../models');
const facebookService = require('./facebookService');

class FacebookInstantReplyService {
  /**
   * Create an instant reply
   */
  async createInstantReply(automationId, replyData) {
    const { trigger = 'new_message', message, delay_seconds = 0, include_name = true, is_active = true } = replyData;

    // Retrieve automation to get page ID
    const automation = await FacebookAutomation.findByPk(automationId);
    if (!automation) throw new Error('Automation not found');

    const reply = await FacebookInstantReply.create({
      facebook_page_id: automation.facebook_page_id,
      facebook_automation_id: automationId,
      trigger,
      message,
      delay_seconds,
      include_name,
      is_active
    });

    return reply;
  }

  /**
   * Get instant replies for an automation
   */
  async getInstantReplies(automationId) {
    return await FacebookInstantReply.findAll({
      where: { facebook_automation_id: automationId },
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Update an instant reply
   */
  async updateInstantReply(replyId, updates) {
    const reply = await FacebookInstantReply.findByPk(replyId);
    if (!reply) {
      throw new Error('Instant reply not found');
    }

    await reply.update(updates);
    return reply;
  }

  /**
   * Delete an instant reply
   */
  async deleteInstantReply(replyId) {
    const reply = await FacebookInstantReply.findByPk(replyId);
    if (!reply) {
      throw new Error('Instant reply not found');
    }

    await reply.destroy();
    return { success: true };
  }

  /**
   * Send instant reply to a conversation
   */
  async sendInstantReply(facebookPageId, senderId, senderName = '', automationId = null) {
    try {
      let replies;

      if (automationId) {
        replies = await FacebookInstantReply.findAll({
          where: {
            facebook_automation_id: automationId,
            is_active: true
          }
        });
      } else {
        // Get all active instant replies for the page
        replies = await FacebookInstantReply.findAll({
          include: [{
            model: FacebookAutomation,
            where: { facebook_page_id: facebookPageId, is_active: true }
          }],
          where: { is_active: true }
        });
      }

      if (replies.length === 0) {
        return null;
      }

      // Get the first active reply (or filter by trigger type)
      const reply = replies[0];

      // Prepare message with optional name inclusion
      let messageText = reply.message;
      if (reply.include_name && senderName) {
        messageText = `Hi ${senderName},\n\n${messageText}`;
      }

      // Send with delay if configured
      if (reply.delay_seconds > 0) {
        setTimeout(() => {
          facebookService.sendMessage(facebookPageId, senderId, messageText);
        }, reply.delay_seconds * 1000);
      } else {
        await facebookService.sendMessage(facebookPageId, senderId, messageText);
      }

      // Update statistics
      await reply.increment('trigger_count');
      await reply.update({ last_triggered_at: new Date() });

      return reply;
    } catch (error) {
      console.error('Failed to send instant reply:', error.message);
      return null;
    }
  }
}

module.exports = new FacebookInstantReplyService();
