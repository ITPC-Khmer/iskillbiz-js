const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const facebookSyncService = require('../services/facebookSyncService');
const { FacebookPage, FacebookAccount, FacebookConversation, FacebookContact } = require('../models');

/**
 * Sync page details FROM Facebook TO System
 */
router.post('/pages/:pageId/sync-from-facebook', requireAuth, async (req, res, next) => {
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

    const result = await facebookSyncService.syncPageDetailsFromFacebook(pageId);
    res.success(result, 'Page details synced from Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Sync all messages FROM Facebook TO System for a conversation
 */
router.post('/conversations/:conversationId/sync-messages-from-facebook', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { id: conversationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!conversation) {
      return res.error('Conversation not found', 404);
    }

    const result = await facebookSyncService.syncMessagesFromFacebook(conversationId);
    res.success(result, 'Messages synced from Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Sync all contacts FROM Facebook TO System
 */
router.post('/pages/:pageId/sync-contacts-from-facebook', requireAuth, async (req, res, next) => {
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

    const result = await facebookSyncService.syncContactsFromFacebook(pageId);
    res.success(result, 'Contacts synced from Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Update page details FROM System TO Facebook
 */
router.put('/pages/:pageId/update-to-facebook', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { about, phone, website } = req.body;

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

    const result = await facebookSyncService.updatePageDetailsToFacebook(pageId, {
      about,
      phone,
      website
    });

    res.success(result, 'Page updated on Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Sync conversation status FROM Facebook TO System
 */
router.post('/conversations/:conversationId/sync-status-from-facebook', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { id: conversationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!conversation) {
      return res.error('Conversation not found', 404);
    }

    const result = await facebookSyncService.syncConversationStatusFromFacebook(conversationId);
    res.success(result, 'Conversation status synced from Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Archive conversation FROM System TO Facebook
 */
router.post('/conversations/:conversationId/archive-on-facebook', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { id: conversationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!conversation) {
      return res.error('Conversation not found', 404);
    }

    const result = await facebookSyncService.archiveConversationOnFacebook(conversationId);
    res.success(result, 'Conversation archived on Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Mute conversation FROM System TO Facebook
 */
router.post('/conversations/:conversationId/mute-on-facebook', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { mute_until = 'PERMANENTLY' } = req.body;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { id: conversationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!conversation) {
      return res.error('Conversation not found', 404);
    }

    const result = await facebookSyncService.muteConversationOnFacebook(conversationId, mute_until);
    res.success(result, 'Conversation muted on Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Mark conversation as read FROM System TO Facebook
 */
router.post('/conversations/:conversationId/mark-read-on-facebook', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { id: conversationId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!conversation) {
      return res.error('Conversation not found', 404);
    }

    const result = await facebookSyncService.markConversationAsReadOnFacebook(conversationId);
    res.success(result, 'Conversation marked as read on Facebook');
  } catch (err) {
    next(err);
  }
});

/**
 * Update contact in system
 */
router.put('/contacts/:contactId/update-in-system', requireAuth, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone, custom_fields, tags, notes } = req.body;

    // Verify ownership
    const contact = await FacebookContact.findOne({
      where: { id: contactId },
      include: [{
        model: FacebookPage,
        include: [{
          model: FacebookAccount,
          where: { user_id: req.user.id }
        }]
      }]
    });

    if (!contact) {
      return res.error('Contact not found', 404);
    }

    const result = await facebookSyncService.updateContactInSystem(contactId, {
      name,
      email,
      phone,
      custom_fields,
      tags,
      notes
    });

    res.success(result, 'Contact updated in system');
  } catch (err) {
    next(err);
  }
});

/**
 * Get sync status for a page
 */
router.get('/pages/:pageId/sync-status', requireAuth, async (req, res, next) => {
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

    const result = await facebookSyncService.getSyncStatus(pageId);
    res.success(result, 'Sync status retrieved');
  } catch (err) {
    next(err);
  }
});

/**
 * Full sync - sync everything from Facebook to system
 */
router.post('/pages/:pageId/full-sync-from-facebook', requireAuth, async (req, res, next) => {
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

    const result = await facebookSyncService.fullSyncFromFacebook(pageId);
    res.success(result, 'Full sync completed', 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

