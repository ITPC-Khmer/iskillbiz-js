const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const facebookService = require('../services/facebookService');
const { FacebookAccount, FacebookPage, FacebookConversation, FacebookMessage, FacebookContact } = require('../models');

// Connect Facebook Account
router.post('/connect', requireAuth, async (req, res, next) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.error('Access token is required', 400);
    }

    const account = await facebookService.connectFacebookAccount(req.user.id, access_token);
    res.success({ account }, 'Facebook account connected successfully', 201);
  } catch (err) {
    next(err);
  }
});

// Get User's Facebook Accounts
router.get('/accounts', requireAuth, async (req, res, next) => {
  try {
    const accounts = await FacebookAccount.findAll({
      where: { user_id: req.user.id },
      include: [{ model: FacebookPage, as: 'pages' }]
    });

    res.success({ accounts }, 'Facebook accounts retrieved');
  } catch (err) {
    next(err);
  }
});

// Sync Pages for an Account
router.post('/accounts/:accountId/sync-pages', requireAuth, async (req, res, next) => {
  try {
    const { accountId } = req.params;

    // Verify ownership
    const account = await FacebookAccount.findOne({
      where: { id: accountId, user_id: req.user.id }
    });

    if (!account) {
      return res.error('Facebook account not found', 404);
    }

    const pages = await facebookService.syncPages(accountId);
    res.success({ pages }, 'Pages synced successfully');
  } catch (err) {
    next(err);
  }
});

// Get Pages
router.get('/pages', requireAuth, async (req, res, next) => {
  try {
    const pages = await FacebookPage.findAll({
      include: [{
        model: FacebookAccount,
        where: { user_id: req.user.id }
      }]
    });

    res.success({ pages }, 'Pages retrieved');
  } catch (err) {
    next(err);
  }
});

// Sync Conversations for a Page
router.post('/pages/:pageId/sync-conversations', requireAuth, async (req, res, next) => {
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

    const conversations = await facebookService.syncConversations(pageId);
    res.success({ conversations }, 'Conversations synced successfully');
  } catch (err) {
    next(err);
  }
});

// Get Conversations for a Page
router.get('/pages/:pageId/conversations', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { status, is_answered } = req.query;

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

    const where = { facebook_page_id: pageId };
    if (status) where.status = status;
    if (is_answered !== undefined) where.is_answered = is_answered === 'true';

    const conversations = await FacebookConversation.findAll({
      where,
      order: [['last_message_time', 'DESC']]
    });

    res.success({ conversations }, 'Conversations retrieved');
  } catch (err) {
    next(err);
  }
});

// Get Unanswered Conversations
router.get('/pages/:pageId/conversations/unanswered', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { hours = 24 } = req.query;

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

    const unanswered = await facebookService.getUnansweredConversations(pageId, parseInt(hours));
    res.success({ conversations: unanswered }, 'Unanswered conversations retrieved');
  } catch (err) {
    next(err);
  }
});

// Sync Messages for a Conversation
router.post('/conversations/:conversationId/sync-messages', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Verify ownership
    const conversation = await FacebookConversation.findOne({
      where: { conversation_id: conversationId },
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

    const messages = await facebookService.syncMessages(conversationId);
    res.success({ messages }, 'Messages synced successfully');
  } catch (err) {
    next(err);
  }
});

// Get Messages for a Conversation
router.get('/conversations/:conversationId/messages', requireAuth, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Find conversation by internal ID
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

    const messages = await FacebookMessage.findAll({
      where: { facebook_conversation_id: conversationId },
      order: [['created_time', 'ASC']]
    });

    res.success({ messages }, 'Messages retrieved');
  } catch (err) {
    next(err);
  }
});

// Send Message
router.post('/pages/:pageId/send-message', requireAuth, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { recipient_id, message } = req.body;

    if (!recipient_id || !message) {
      return res.error('recipient_id and message are required', 400);
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

    const result = await facebookService.sendMessage(pageId, recipient_id, message);
    res.success({ result }, 'Message sent successfully');
  } catch (err) {
    next(err);
  }
});

// Get Contacts for a Page
router.get('/pages/:pageId/contacts', requireAuth, async (req, res, next) => {
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

    const contacts = await FacebookContact.findAll({
      where: { facebook_page_id: pageId },
      order: [['last_interaction', 'DESC']]
    });

    res.success({ contacts }, 'Contacts retrieved');
  } catch (err) {
    next(err);
  }
});

// Update Contact
router.put('/contacts/:contactId', requireAuth, async (req, res, next) => {
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

    await contact.update({
      name: name || contact.name,
      email: email || contact.email,
      phone: phone || contact.phone,
      custom_fields: custom_fields || contact.custom_fields,
      tags: tags || contact.tags,
      notes: notes || contact.notes
    });

    res.success({ contact }, 'Contact updated successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;

