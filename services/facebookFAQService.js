const { FacebookFAQ, FacebookFAQLog } = require('../models');
const facebookService = require('./facebookService');

class FacebookFAQService {
  /**
   * Create an FAQ entry
   */
  async createFAQ(facebookPageId, faqData) {
    const { question, answer, keywords = [], category = null, order = 0, is_active = true } = faqData;

    const faq = await FacebookFAQ.create({
      facebook_page_id: facebookPageId,
      question,
      answer,
      keywords,
      category,
      order,
      is_active
    });

    return faq;
  }

  /**
   * Get all FAQs for a page
   */
  async getFAQs(facebookPageId, filters = {}) {
    const where = { facebook_page_id: facebookPageId };

    if (filters.category) where.category = filters.category;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    return await FacebookFAQ.findAll({
      where,
      order: [['order', 'ASC'], ['created_at', 'DESC']]
    });
  }

  /**
   * Get FAQ by ID
   */
  async getFAQById(faqId) {
    return await FacebookFAQ.findByPk(faqId, {
      include: [{ model: FacebookFAQLog, as: 'logs' }]
    });
  }

  /**
   * Update an FAQ
   */
  async updateFAQ(faqId, updates) {
    const faq = await FacebookFAQ.findByPk(faqId);
    if (!faq) {
      throw new Error('FAQ not found');
    }

    await faq.update(updates);
    return faq;
  }

  /**
   * Delete an FAQ
   */
  async deleteFAQ(faqId) {
    const faq = await FacebookFAQ.findByPk(faqId);
    if (!faq) {
      throw new Error('FAQ not found');
    }

    await faq.destroy();
    return { success: true };
  }

  /**
   * Search FAQs by keywords
   */
  async searchFAQsByKeywords(facebookPageId, searchText) {
    const faqs = await FacebookFAQ.findAll({
      where: {
        facebook_page_id: facebookPageId,
        is_active: true
      }
    });

    const searchLower = searchText.toLowerCase();
    const matches = [];

    for (const faq of faqs) {
      // Check if question or answer contains search text
      if (faq.question.toLowerCase().includes(searchLower) ||
          faq.answer.toLowerCase().includes(searchLower)) {
        matches.push(faq);
        continue;
      }

      // Check if any keywords match
      if (faq.keywords && Array.isArray(faq.keywords)) {
        for (const keyword of faq.keywords) {
          if (keyword.toLowerCase().includes(searchLower) ||
              searchLower.includes(keyword.toLowerCase())) {
            matches.push(faq);
            break;
          }
        }
      }
    }

    return matches;
  }

  /**
   * Send FAQ answer to conversation
   */
  async sendFAQAnswer(faqId, facebookPageId, senderId, conversationId = null) {
    try {
      const faq = await FacebookFAQ.findByPk(faqId);
      if (!faq) {
        throw new Error('FAQ not found');
      }

      // Send the answer
      await facebookService.sendMessage(facebookPageId, senderId, faq.answer);

      // Log the usage
      await FacebookFAQLog.create({
        facebook_faq_id: faqId,
        facebook_conversation_id: conversationId,
        message_id: null
      });

      // Update match count
      await faq.increment('match_count');
      await faq.update({ last_used_at: new Date() });

      return { success: true, faq };
    } catch (error) {
      console.error('Failed to send FAQ:', error.message);
      throw error;
    }
  }

  /**
   * Record FAQ feedback (helpful/unhelpful)
   */
  async recordFAQFeedback(faqLogId, feedback) {
    try {
      const log = await FacebookFAQLog.findByPk(faqLogId);
      if (!log) {
        throw new Error('FAQ log not found');
      }

      // Update log
      await log.update({ user_feedback: feedback });

      // Update FAQ statistics
      const faq = await FacebookFAQ.findByPk(log.facebook_faq_id);
      if (feedback === 'helpful') {
        await faq.increment('helpful_count');
      } else if (feedback === 'unhelpful') {
        await faq.increment('unhelpful_count');
      }

      return { success: true, log };
    } catch (error) {
      console.error('Failed to record feedback:', error.message);
      throw error;
    }
  }

  /**
   * Get FAQ statistics
   */
  async getFAQStatistics(facebookPageId) {
    const faqs = await FacebookFAQ.findAll({
      where: { facebook_page_id: facebookPageId },
      include: [{ model: FacebookFAQLog, as: 'logs' }]
    });

    const stats = {
      total_faqs: faqs.length,
      total_uses: 0,
      total_helpful: 0,
      total_unhelpful: 0,
      faqs_by_category: {},
      top_faqs: []
    };

    for (const faq of faqs) {
      stats.total_uses += faq.match_count;
      stats.total_helpful += faq.helpful_count;
      stats.total_unhelpful += faq.unhelpful_count;

      // Group by category
      if (faq.category) {
        if (!stats.faqs_by_category[faq.category]) {
          stats.faqs_by_category[faq.category] = 0;
        }
        stats.faqs_by_category[faq.category]++;
      }
    }

    // Get top 5 FAQs by usage
    stats.top_faqs = faqs
      .sort((a, b) => b.match_count - a.match_count)
      .slice(0, 5)
      .map(faq => ({
        id: faq.id,
        question: faq.question,
        uses: faq.match_count,
        helpful: faq.helpful_count,
        unhelpful: faq.unhelpful_count
      }));

    return stats;
  }

  /**
   * Get FAQ categories
   */
  async getFAQCategories(facebookPageId) {
    const faqs = await FacebookFAQ.findAll({
      where: {
        facebook_page_id: facebookPageId,
        is_active: true
      },
      attributes: ['category'],
      group: ['category'],
      raw: true
    });

    return faqs
      .map(faq => faq.category)
      .filter(cat => cat !== null && cat !== '');
  }

  /**
   * Bulk import FAQs
   */
  async bulkImportFAQs(facebookPageId, faqs) {
    try {
      const created = [];
      for (let i = 0; i < faqs.length; i++) {
        const faqData = {
          ...faqs[i],
          order: i
        };
        const faq = await this.createFAQ(facebookPageId, faqData);
        created.push(faq);
      }
      return created;
    } catch (error) {
      console.error('Failed to bulk import FAQs:', error.message);
      throw error;
    }
  }
}

module.exports = new FacebookFAQService();

