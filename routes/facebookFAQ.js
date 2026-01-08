const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const facebookFAQService = require('../services/facebookFAQService');
const { FacebookFAQ, FacebookFAQLog, FacebookPage, FacebookAccount } = require('../models');

// Create FAQ
router.post('/pages/:pageId/faqs', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { question, answer, keywords, category, order, is_active } = req.body;

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const faq = await facebookFAQService.createFAQ(pageId, {
      question,
      answer,
      keywords,
      category,
      order,
      is_active
    });

    res.success({ faq }, 'FAQ created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get FAQs for Page
router.get('/pages/:pageId/faqs', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { category, is_active } = req.query;

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const filters = {};
    if (category) filters.category = category;
    if (is_active !== undefined) filters.is_active = is_active === 'true';

    const faqs = await facebookFAQService.getFAQs(pageId, filters);
    res.success({ faqs }, 'FAQs retrieved');
  } catch (err) {
    next(err);
  }
});

// Get FAQ by ID
router.get('/faqs/:faqId', requireAuth, async (req, res, next) => {
  try {
    const { faqId } = req.params;

    // Verify ownership
    const faq = await FacebookFAQ.findOne({
      where: { id: faqId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!faq) {
      return res.error('FAQ not found', 404);
    }

    const detailed = await facebookFAQService.getFAQById(faqId);
    res.success({ faq: detailed }, 'FAQ retrieved');
  } catch (err) {
    next(err);
  }
});

// Update FAQ
router.put('/faqs/:faqId', requireAuth, async (req, res, next) => {
  try {
    const { faqId } = req.params;
    const updates = req.body;

    // Verify ownership
    const faq = await FacebookFAQ.findOne({
      where: { id: faqId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!faq) {
      return res.error('FAQ not found', 404);
    }

    const updated = await facebookFAQService.updateFAQ(faqId, updates);
    res.success({ faq: updated }, 'FAQ updated successfully');
  } catch (err) {
    next(err);
  }
});

// Delete FAQ
router.delete('/faqs/:faqId', requireAuth, async (req, res, next) => {
  try {
    const { faqId } = req.params;

    // Verify ownership
    const faq = await FacebookFAQ.findOne({
      where: { id: faqId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!faq) {
      return res.error('FAQ not found', 404);
    }

    await facebookFAQService.deleteFAQ(faqId);
    res.success(null, 'FAQ deleted successfully');
  } catch (err) {
    next(err);
  }
});

// Search FAQs by Keywords
router.get('/pages/:pageId/faqs/search', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { q } = req.query;

    if (!q) {
      return res.error('Search query is required', 400);
    }

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const results = await facebookFAQService.searchFAQsByKeywords(pageId, q);
    res.success({ results }, 'FAQ search completed');
  } catch (err) {
    next(err);
  }
});

// Send FAQ Answer to Conversation
router.post('/faqs/:faqId/send/:conversationId', requireAuth, async (req, res, next) => {
  try {
    const { faqId, conversationId } = req.params;

    // Verify ownership and get page
    const faq = await FacebookFAQ.findOne({
      where: { id: faqId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!faq) {
      return res.error('FAQ not found', 404);
    }

    const { senderId } = req.body;
    if (!senderId) {
      return res.error('senderId is required', 400);
    }

    const result = await facebookFAQService.sendFAQAnswer(
      faqId,
      faq.facebook_page_id,
      senderId,
      conversationId
    );

    res.success(result, 'FAQ answer sent successfully');
  } catch (err) {
    next(err);
  }
});

// Record FAQ Feedback
router.post('/faq-logs/:logId/feedback', requireAuth, async (req, res, next) => {
  try {
    const { logId } = req.params;
    const { feedback } = req.body;

    if (!['helpful', 'unhelpful', 'none'].includes(feedback)) {
      return res.error('Invalid feedback value', 400);
    }

    // Verify ownership
    const log = await FacebookFAQLog.findOne({
      where: { id: logId },
      include: [{
        model: FacebookFAQ,
        include: [{
          model: FacebookPage,
          include: [{
            model: FacebookAccount,
            where: { user_id: req.user.id }
          }]
        }]
      }]
    });

    if (!log) {
      return res.error('FAQ log not found', 404);
    }

    const result = await facebookFAQService.recordFAQFeedback(logId, feedback);
    res.success(result, 'Feedback recorded successfully');
  } catch (err) {
    next(err);
  }
});

// Get FAQ Statistics
router.get('/pages/:pageId/faqs/stats', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const stats = await facebookFAQService.getFAQStatistics(pageId);
    res.success({ stats }, 'FAQ statistics retrieved');
  } catch (err) {
    next(err);
  }
});

// Get FAQ Categories
router.get('/pages/:pageId/faq-categories', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const categories = await facebookFAQService.getFAQCategories(pageId);
    res.success({ categories }, 'FAQ categories retrieved');
  } catch (err) {
    next(err);
  }
});

// Bulk Import FAQs
router.post('/pages/:pageId/faqs/bulk-import', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { faqs } = req.body;

    if (!Array.isArray(faqs)) {
      return res.error('FAQs must be an array', 400);
    }

    // Verify ownership
    const page = await FacebookPage.findOne({
      where: { id: pageId },
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    if (!page) {
      return res.error('Facebook page not found', 404);
    }

    const created = await facebookFAQService.bulkImportFAQs(pageId, faqs);
    res.success({ created, count: created.length }, 'FAQs imported successfully', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

