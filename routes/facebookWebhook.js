const express = require('express');
const router = express.Router();
const facebookService = require('../services/facebookService');
const facebookAutomationService = require('../services/facebookAutomationService');
const facebookInstantReplyService = require('../services/facebookInstantReplyService');
const { FacebookPage, FacebookContact } = require('../models');

// Webhook verification (GET)
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'iskillbiz_webhook_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Webhook events (POST)
router.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    // Process each entry
    for (const entry of body.entry) {
      const pageId = entry.id;

      // Find the page in our database
      const page = await FacebookPage.findOne({ where: { page_id: pageId } });
      if (!page) {
        console.log(`Page ${pageId} not found in database`);
        continue;
      }

      // Process messaging events
      if (entry.messaging) {
        for (const event of entry.messaging) {
          await handleMessagingEvent(page, event);
        }
      }

      // Process changes (comments, etc.)
      if (entry.changes) {
        for (const change of entry.changes) {
          await handleChangeEvent(page, change);
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

/**
 * Handle messaging events
 */
async function handleMessagingEvent(page, event) {
  const senderId = event.sender.id;

  try {
    // Handle message
    if (event.message && !event.message.is_echo) {
      const message = event.message.text;

      // Sync the conversation
      const conversationId = `t_${senderId}`;
      await facebookService.syncMessages(conversationId);

      // Get sender name for personalization
      let senderName = '';
      const contact = await FacebookContact.findOne({ where: { facebook_page_id: page.id, facebook_user_id: senderId } });
      if (contact) senderName = contact.name;

      // Process keywords
      const keywordMatched = await facebookAutomationService.processKeywords(
        page.id,
        message,
        senderId
      );

      // If keyword matched, stop further processing
      if (keywordMatched) return;

      // Check for away message
      const awayMessageSent = await facebookAutomationService.sendAwayMessage(page.id, senderId);

      // If away message sent, we might stop or continue depending on policy. Usually stop.
      if (awayMessageSent) return;

      // Check for Instant Reply (Welcome/Default)
      const instantReplySent = await facebookInstantReplyService.sendInstantReply(page.id, senderId, senderName);

      // Request contact info if needed and nothing else sent
      if (!instantReplySent) {
          await facebookAutomationService.requestContactInfo(page.id, senderId);
      }
    }

    // Handle message read
    if (event.read) {
      const conversationId = `t_${senderId}`;
      await facebookService.markAsAnswered(conversationId);
    }

    // Handle postback
    if (event.postback) {
      const payload = event.postback.payload;
      // Handle postback based on payload
      console.log('Postback received:', payload);
    }
  } catch (error) {
    console.error('Error handling messaging event:', error);
  }
}

/**
 * Handle change events (comments, etc.)
 */
async function handleChangeEvent(page, change) {
  try {
    if (change.field === 'feed') {
      // Handle comment
      if (change.value.item === 'comment') {
        const commentData = {
          from: change.value.from,
          message: change.value.message,
          post_id: change.value.post_id,
          comment_id: change.value.comment_id
        };

        // Trigger comment to message automation
        await facebookAutomationService.handleCommentToMessage(page.id, commentData);
      }
    }
  } catch (error) {
    console.error('Error handling change event:', error);
  }
}

module.exports = router;
