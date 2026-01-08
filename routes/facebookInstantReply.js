const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const facebookInstantReplyService = require('../services/facebookInstantReplyService');
const { FacebookInstantReply, FacebookAutomation, FacebookPage, FacebookAccount } = require('../models');

// Create Instant Reply
router.post('/automations/:automationId/instant-replies', requireAuth, async (req, res, next) => {
  try {
    const { automationId } = req.params;
    const { trigger, message, delay_seconds, include_name, is_active } = req.body;

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

    const reply = await facebookInstantReplyService.createInstantReply(automationId, {
      trigger,
      message,
      delay_seconds,
      include_name,
      is_active
    });

    res.success({ reply }, 'Instant reply created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get Instant Replies for Automation
router.get('/automations/:automationId/instant-replies', requireAuth, async (req, res, next) => {
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

    const replies = await facebookInstantReplyService.getInstantReplies(automationId);
    res.success({ replies }, 'Instant replies retrieved');
  } catch (err) {
    next(err);
  }
});

// Update Instant Reply
router.put('/instant-replies/:replyId', requireAuth, async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const updates = req.body;

    // Verify ownership
    const reply = await FacebookInstantReply.findOne({
      where: { id: replyId },
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

    if (!reply) {
      return res.error('Instant reply not found', 404);
    }

    const updated = await facebookInstantReplyService.updateInstantReply(replyId, updates);
    res.success({ reply: updated }, 'Instant reply updated successfully');
  } catch (err) {
    next(err);
  }
});

// Delete Instant Reply
router.delete('/instant-replies/:replyId', requireAuth, async (req, res, next) => {
  try {
    const { replyId } = req.params;

    // Verify ownership
    const reply = await FacebookInstantReply.findOne({
      where: { id: replyId },
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

    if (!reply) {
      return res.error('Instant reply not found', 404);
    }

    await facebookInstantReplyService.deleteInstantReply(replyId);
    res.success(null, 'Instant reply deleted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

