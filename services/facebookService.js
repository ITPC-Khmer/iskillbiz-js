const axios = require('axios');
const { FacebookAccount, FacebookPage, FacebookConversation, FacebookMessage, FacebookContact } = require('../models');

class FacebookService {
  constructor() {
    this.graphApiUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Connect Facebook account for a user
   */
  async connectFacebookAccount(userId, accessToken) {
    try {
      // Get user info from Facebook
      const { data: fbUser } = await axios.get(`${this.graphApiUrl}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken
        }
      });

      // Check token expiration
      const { data: tokenInfo } = await axios.get(`${this.graphApiUrl}/debug_token`, {
        params: {
          input_token: accessToken,
          access_token: accessToken
        }
      });

      const expiresAt = tokenInfo.data.expires_at
        ? new Date(tokenInfo.data.expires_at * 1000)
        : null;

      // Create or update Facebook account
      const [account] = await FacebookAccount.upsert({
        user_id: userId,
        facebook_user_id: fbUser.id,
        access_token: accessToken,
        token_expires_at: expiresAt,
        name: fbUser.name,
        email: fbUser.email,
        status: 'active'
      }, {
        returning: true
      });

      return account;
    } catch (error) {
      throw new Error(`Failed to connect Facebook account: ${error.message}`);
    }
  }

  /**
   * Sync all Facebook pages for an account
   */
  async syncPages(facebookAccountId) {
    try {
      const account = await FacebookAccount.findByPk(facebookAccountId);
      if (!account) {
        throw new Error('Facebook account not found');
      }

      // Get all pages the user manages
      const { data } = await axios.get(`${this.graphApiUrl}/me/accounts`, {
        params: {
          fields: 'id,name,access_token,category,about,picture,fan_count',
          access_token: account.access_token
        }
      });

      const pages = [];
      for (const pageData of data.data) {
        const [page] = await FacebookPage.upsert({
          facebook_account_id: facebookAccountId,
          page_id: pageData.id,
          page_access_token: pageData.access_token,
          name: pageData.name,
          category: pageData.category,
          about: pageData.about,
          picture_url: pageData.picture?.data?.url,
          fan_count: pageData.fan_count || 0,
          status: 'active',
          last_synced_at: new Date()
        }, {
          returning: true
        });

        pages.push(page);

        // Subscribe to page webhooks
        await this.subscribePageWebhook(page);
      }

      return pages;
    } catch (error) {
      throw new Error(`Failed to sync pages: ${error.message}`);
    }
  }

  /**
   * Subscribe page to webhooks
   */
  async subscribePageWebhook(page) {
    try {
      await axios.post(
        `${this.graphApiUrl}/${page.page_id}/subscribed_apps`,
        null,
        {
          params: {
            subscribed_fields: 'messages,messaging_postbacks,message_reads,message_deliveries',
            access_token: page.page_access_token
          }
        }
      );

      await page.update({ is_subscribed: true });
    } catch (error) {
      console.error(`Failed to subscribe page ${page.page_id}:`, error.message);
    }
  }

  /**
   * Sync conversations for a page
   */
  async syncConversations(facebookPageId) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) {
        throw new Error('Facebook page not found');
      }

      // Get conversations from Facebook
      const { data } = await axios.get(`${this.graphApiUrl}/${page.page_id}/conversations`, {
        params: {
          fields: 'id,participants,unread_count,message_count,updated_time,can_reply,subject,messages.limit(1){id,from,message,created_time}',
          access_token: page.page_access_token
        }
      });

      const conversations = [];
      for (const conv of data.data) {
        const participant = conv.participants?.data?.find(p => p.id !== page.page_id);
        const lastMessage = conv.messages?.data?.[0];

        const [conversation] = await FacebookConversation.upsert({
          facebook_page_id: facebookPageId,
          conversation_id: conv.id,
          participant_id: participant?.id,
          participant_name: participant?.name,
          unread_count: conv.unread_count || 0,
          message_count: conv.message_count || 0,
          last_message_time: lastMessage?.created_time,
          last_message_text: lastMessage?.message,
          can_reply: conv.can_reply ?? true,
          subject: conv.subject,
          participants_data: conv.participants?.data,
          is_answered: conv.unread_count === 0,
          status: 'active'
        }, {
          returning: true
        });

        conversations.push(conversation);
      }

      return conversations;
    } catch (error) {
      throw new Error(`Failed to sync conversations: ${error.message}`);
    }
  }

  /**
   * Sync messages for a conversation
   */
  async syncMessages(conversationId) {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { conversation_id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const page = conversation.FacebookPage;

      // Get messages from Facebook
      const { data } = await axios.get(`${this.graphApiUrl}/${conversationId}/messages`, {
        params: {
          fields: 'id,from,to,message,created_time,attachments,sticker,tags,reply_to',
          access_token: page.page_access_token,
          limit: 100
        }
      });

      const messages = [];
      for (const msg of data.data) {
        const [message] = await FacebookMessage.upsert({
          facebook_conversation_id: conversation.id,
          message_id: msg.id,
          from_id: msg.from.id,
          from_name: msg.from.name,
          to_data: msg.to?.data,
          message: msg.message,
          sticker: msg.sticker,
          reply_to: msg.reply_to,
          tags: msg.tags,
          created_time: msg.created_time,
          is_from_page: msg.from.id === page.page_id,
          has_attachments: !!msg.attachments,
          attachments: msg.attachments
        }, {
          returning: true
        });

        messages.push(message);

        // Create or update contact
        if (msg.from.id !== page.page_id) {
          await this.upsertContact(page.id, msg.from);
        }
      }

      return messages;
    } catch (error) {
      throw new Error(`Failed to sync messages: ${error.message}`);
    }
  }

  /**
   * Send a message to a conversation
   */
  async sendMessage(facebookPageId, recipientId, message) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) {
        throw new Error('Facebook page not found');
      }

      const { data } = await axios.post(
        `${this.graphApiUrl}/me/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message }
        },
        {
          params: {
            access_token: page.page_access_token
          }
        }
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Get unanswered conversations
   */
  async getUnansweredConversations(facebookPageId, hoursThreshold = 24) {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return await FacebookConversation.findAll({
      where: {
        facebook_page_id: facebookPageId,
        is_answered: false,
        last_message_time: {
          [require('sequelize').Op.lt]: threshold
        },
        status: 'open'
      },
      order: [['last_message_time', 'ASC']]
    });
  }

  /**
   * Upsert contact information
   */
  async upsertContact(facebookPageId, fbUser) {
    try {
      const [contact] = await FacebookContact.upsert({
        facebook_page_id: facebookPageId,
        facebook_user_id: fbUser.id,
        name: fbUser.name,
        profile_pic: fbUser.picture?.data?.url,
        last_interaction: new Date()
      }, {
        returning: true
      });

      return contact;
    } catch (error) {
      console.error('Failed to upsert contact:', error.message);
    }
  }

  /**
   * Mark conversation as answered
   */
  async markAsAnswered(conversationId) {
    const conversation = await FacebookConversation.findOne({
      where: { conversation_id: conversationId }
    });

    if (conversation) {
      await conversation.update({ is_answered: true, unread_count: 0 });
    }
  }
}

module.exports = new FacebookService();

