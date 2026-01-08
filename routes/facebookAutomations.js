const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const facebookAutomationService = require('../services/facebookAutomationService');
const { FacebookAutomation, FacebookKeyword, FacebookPage, FacebookAccount } = require('../models');

// Create Automation
router.post('/pages/:pageId/automations', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { name, type, is_active, config } = req.body;

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

    const automation = await facebookAutomationService.createAutomation(pageId, {
      name,
      type,
      is_active,
      config
    });

    res.success({ automation }, 'Automation created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get Automations for a Page
router.get('/pages/:pageId/automations', requireAuth, async (req, res, next) => {
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

    const automations = await facebookAutomationService.getAutomations(pageId);
    res.success({ automations }, 'Automations retrieved');
  } catch (err) {
    next(err);
  }
});

// Update Automation
router.put('/automations/:automationId', requireAuth, async (req, res, next) => {
  try {
    const { automationId } = req.params;
    const updates = req.body;

    // Verify ownership
    const automation = await FacebookAutomation.findOne({
      where: { id: automationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!automation) {
      return res.error('Automation not found', 404);
    }

    const updated = await facebookAutomationService.updateAutomation(automationId, updates);
    res.success({ automation: updated }, 'Automation updated successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Automation
router.delete('/automations/:automationId', requireAuth, async (req, res, next) => {
  try {
    const { automationId } = req.params;

    // Verify ownership
    const automation = await FacebookAutomation.findOne({
      where: { id: automationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!automation) {
      return res.error('Automation not found', 404);
    }

    await facebookAutomationService.deleteAutomation(automationId);
    res.success(null, 'Automation deleted successfully');
  } catch (err) {
    next(err);
  }
});

// Create Keyword for Automation
router.post('/automations/:automationId/keywords', requireAuth, async (req, res, next) => {
  try {
    const { automationId } = req.params;
    const { keyword, match_type, response_message, is_active } = req.body;

    // Verify ownership
    const automation = await FacebookAutomation.findOne({
      where: { id: automationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!automation) {
      return res.error('Automation not found', 404);
    }

    const keywordRule = await facebookAutomationService.createKeyword(automationId, {
      keyword,
      match_type,
      response_message,
      is_active
    });

    res.success({ keyword: keywordRule }, 'Keyword created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get Keywords for Automation
router.get('/automations/:automationId/keywords', requireAuth, async (req, res, next) => {
  try {
    const { automationId } = req.params;

    // Verify ownership
    const automation = await FacebookAutomation.findOne({
      where: { id: automationId },
      include: [
        {
          model: FacebookPage,
          include: [{
            model: FacebookAccount,
            where: { user_id: req.user.id }
          }]
        },
        {
          model: FacebookKeyword,
          as: 'keywords'
        }
      ]
    });

    if (!automation) {
      return res.error('Automation not found', 404);
    }

    res.success({ keywords: automation.keywords }, 'Keywords retrieved');
  } catch (err) {
    next(err);
  }
});

// Update Keyword
router.put('/keywords/:keywordId', requireAuth, async (req, res, next) => {
  try {
    const { keywordId } = req.params;
    const updates = req.body;

    // Verify ownership
    const keyword = await FacebookKeyword.findOne({
      where: { id: keywordId },
      include: [{
        model: FacebookAutomation,
        include: [{
          model: FacebookPage,
          include: [{
            model: FacebookAccount,
            where: { user_id: req.user.id }
          }]
        }]
      }]
    });

    if (!keyword) {
      return res.error('Keyword not found', 404);
    }

    await keyword.update(updates);
    res.success({ keyword }, 'Keyword updated successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Keyword
router.delete('/keywords/:keywordId', requireAuth, async (req, res, next) => {
  try {
    const { keywordId } = req.params;

    // Verify ownership
    const keyword = await FacebookKeyword.findOne({
      where: { id: keywordId },
      include: [{
        model: FacebookAutomation,
        include: [{
          model: FacebookPage,
          include: [{
            model: FacebookAccount,
            where: { user_id: req.user.id }
          }]
        }]
      }]
    });

    if (!keyword) {
      return res.error('Keyword not found', 404);
    }

    await keyword.destroy();
    res.success(null, 'Keyword deleted successfully');
  } catch (err) {
    next(err);
  }
});

// Check Unanswered Messages for a Page
router.get('/pages/:pageId/unanswered-check', requireAuth, async (req, res, next) => {
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

    const unanswered = await facebookAutomationService.checkUnansweredMessages(pageId);
    res.success({ unanswered }, 'Unanswered messages check completed');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

