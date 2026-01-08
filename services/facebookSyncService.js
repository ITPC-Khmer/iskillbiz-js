const axios = require('axios');
const { FacebookPage, FacebookMessage, FacebookConversation, FacebookContact } = require('../models');

class FacebookSyncService {
  constructor() {
    this.graphApiUrl = 'https://graph.facebook.com/v18.0';
  }

  /**
   * Sync page details from Facebook to system
   */
  async syncPageDetailsFromFacebook(facebookPageId) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) throw new Error('Page not found');

      const { data } = await axios.get(`${this.graphApiUrl}/${page.page_id}`, {
        params: {
          fields: 'id,name,category,about,picture,fan_count,phone,website,single_line_address,cover',
          access_token: page.page_access_token
        }
      });

      // Update page in system
      await page.update({
        name: data.name,
        category: data.category,
        about: data.about,
        picture_url: data.picture?.data?.url,
        fan_count: data.fan_count,
        last_synced_at: new Date()
      });

      return {
        success: true,
        page: {
          id: page.id,
          name: data.name,
          category: data.category,
          about: data.about,
          fan_count: data.fan_count,
          synced_at: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Failed to sync page details: ${error.message}`);
    }
  }

  /**
   * Sync all messages from Facebook to system for a conversation
   */
  async syncMessagesFromFacebook(conversationId) {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) throw new Error('Conversation not found');

      const page = conversation.FacebookPage;

      const { data } = await axios.get(`${this.graphApiUrl}/${conversation.conversation_id}/messages`, {
        params: {
          fields: 'id,from,message,created_time,attachments,sticker',
          access_token: page.page_access_token,
          limit: 100
        }
      });

      const syncedMessages = [];

      for (const msg of data.data) {
        const { FacebookMessage } = require('../models');
        const [message, created] = await FacebookMessage.findOrCreate({
          where: { message_id: msg.id },
          defaults: {
            facebook_conversation_id: conversation.id,
            message_id: msg.id,
            from_id: msg.from.id,
            from_name: msg.from.name,
            message: msg.message || null,
            created_time: msg.created_time,
            is_from_page: msg.from.id === page.page_id,
            has_attachments: !!msg.attachments,
            attachments: msg.attachments || null
          }
        });

        syncedMessages.push({
          id: message.id,
          facebook_message_id: msg.id,
          created: created,
          from: msg.from.name
        });
      }

      // Update conversation stats
      await conversation.update({
        message_count: syncedMessages.length,
        last_synced_at: new Date()
      });

      return {
        success: true,
        synced_count: syncedMessages.length,
        messages: syncedMessages
      };
    } catch (error) {
      throw new Error(`Failed to sync messages: ${error.message}`);
    }
  }

  /**
   * Sync all contacts from Facebook to system
   */
  async syncContactsFromFacebook(facebookPageId) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) throw new Error('Page not found');

      // Get all conversations to extract participant info
      const { data: conversations } = await axios.get(`${this.graphApiUrl}/${page.page_id}/conversations`, {
        params: {
          fields: 'participants,unread_count',
          access_token: page.page_access_token,
          limit: 100
        }
      });

      const syncedContacts = [];

      for (const conv of conversations.data) {
        const participant = conv.participants?.data?.find(p => p.id !== page.page_id);

        if (participant) {
          const [contact, created] = await FacebookContact.findOrCreate({
            where: {
              facebook_page_id: facebookPageId,
              facebook_user_id: participant.id
            },
            defaults: {
              facebook_page_id: facebookPageId,
              facebook_user_id: participant.id,
              name: participant.name,
              last_interaction: new Date()
            }
          });

          syncedContacts.push({
            id: contact.id,
            name: participant.name,
            facebook_id: participant.id,
            created: created
          });
        }
      }

      return {
        success: true,
        synced_count: syncedContacts.length,
        contacts: syncedContacts
      };
    } catch (error) {
      throw new Error(`Failed to sync contacts: ${error.message}`);
    }
  }

  /**
   * Update page details to Facebook
   */
  async updatePageDetailsToFacebook(facebookPageId, updates) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) throw new Error('Page not found');

      const updateData = {};

      // Map system fields to Facebook fields
      if (updates.about) updateData.about = updates.about;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.website) updateData.website = updates.website;

      if (Object.keys(updateData).length === 0) {
        return { success: false, message: 'No valid fields to update' };
      }

      // Update on Facebook
      await axios.post(`${this.graphApiUrl}/${page.page_id}`, updateData, {
        params: {
          access_token: page.page_access_token
        }
      });

      // Update in system
      const fieldsToUpdate = {};
      if (updates.about) fieldsToUpdate.about = updates.about;

      await page.update(fieldsToUpdate);

      return {
        success: true,
        message: 'Page updated successfully',
        updated_fields: Object.keys(updateData)
      };
    } catch (error) {
      throw new Error(`Failed to update page on Facebook: ${error.message}`);
    }
  }

  /**
   * Sync conversation status from Facebook
   */
  async syncConversationStatusFromFacebook(conversationId) {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) throw new Error('Conversation not found');

      const page = conversation.FacebookPage;

      const { data } = await axios.get(`${this.graphApiUrl}/${conversation.conversation_id}`, {
        params: {
          fields: 'unread_count,wallpaper,former_participants',
          access_token: page.page_access_token
        }
      });

      await conversation.update({
        unread_count: data.unread_count || 0
      });

      return {
        success: true,
        unread_count: data.unread_count,
        synced_at: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to sync conversation status: ${error.message}`);
    }
  }

  /**
   * Archive conversation on Facebook
   */
  async archiveConversationOnFacebook(conversationId) {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) throw new Error('Conversation not found');

      const page = conversation.FacebookPage;

      await axios.post(`${this.graphApiUrl}/${conversation.conversation_id}`, {
        is_subscribed: false
      }, {
        params: {
          access_token: page.page_access_token
        }
      });

      await conversation.update({ status: 'archived' });

      return { success: true, message: 'Conversation archived' };
    } catch (error) {
      throw new Error(`Failed to archive conversation: ${error.message}`);
    }
  }

  /**
   * Mute conversation on Facebook
   */
  async muteConversationOnFacebook(conversationId, muteTime = 'PERMANENTLY') {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) throw new Error('Conversation not found');

      const page = conversation.FacebookPage;

      await axios.post(`${this.graphApiUrl}/${conversation.conversation_id}/mute`, {
        mute_until: muteTime
      }, {
        params: {
          access_token: page.page_access_token
        }
      });

      return { success: true, message: `Conversation muted until ${muteTime}` };
    } catch (error) {
      throw new Error(`Failed to mute conversation: ${error.message}`);
    }
  }

  /**
   * Mark conversation as read on Facebook
   */
  async markConversationAsReadOnFacebook(conversationId) {
    try {
      const conversation = await FacebookConversation.findOne({
        where: { id: conversationId },
        include: [{ model: FacebookPage, as: 'FacebookPage' }]
      });

      if (!conversation) throw new Error('Conversation not found');

      const page = conversation.FacebookPage;

      await axios.post(`${this.graphApiUrl}/${conversation.conversation_id}`, {
        marked_read: true
      }, {
        params: {
          access_token: page.page_access_token
        }
      });

      await conversation.update({ unread_count: 0 });

      return { success: true, message: 'Conversation marked as read' };
    } catch (error) {
      throw new Error(`Failed to mark conversation as read: ${error.message}`);
    }
  }

  /**
   * Update contact info in system
   */
  async updateContactInSystem(contactId, updates) {
    try {
      const contact = await FacebookContact.findByPk(contactId);
      if (!contact) throw new Error('Contact not found');

      const allowedFields = ['name', 'email', 'phone', 'custom_fields', 'tags', 'notes'];
      const fieldsToUpdate = {};

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          fieldsToUpdate[field] = updates[field];
        }
      }

      await contact.update(fieldsToUpdate);

      return {
        success: true,
        contact
      };
    } catch (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }

  /**
   * Get sync status for a page
   */
  async getSyncStatus(facebookPageId) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId, {
        include: [
          { model: FacebookConversation, as: 'conversations' },
          { model: FacebookContact, as: 'contacts' }
        ]
      });

      if (!page) throw new Error('Page not found');

      return {
        page: {
          id: page.id,
          name: page.name,
          status: page.status,
          last_synced_at: page.last_synced_at
        },
        statistics: {
          total_conversations: page.conversations?.length || 0,
          total_contacts: page.contacts?.length || 0,
          last_sync: page.last_synced_at
        }
      };
    } catch (error) {
      throw new Error(`Failed to get sync status: ${error.message}`);
    }
  }

  /**
   * Full sync - sync everything from Facebook to system
   */
  async fullSyncFromFacebook(facebookPageId) {
    try {
      const page = await FacebookPage.findByPk(facebookPageId);
      if (!page) throw new Error('Page not found');

      const results = {
        page_details: await this.syncPageDetailsFromFacebook(facebookPageId),
        contacts: await this.syncContactsFromFacebook(facebookPageId),
        conversations: []
      };

      // Sync conversations and their messages
      const conversations = await FacebookConversation.findAll({
        where: { facebook_page_id: facebookPageId }
      });

      for (const conv of conversations) {
        try {
          const msgResult = await this.syncMessagesFromFacebook(conv.id);
          results.conversations.push({
            id: conv.id,
            messages_synced: msgResult.synced_count
          });
        } catch (error) {
          console.error(`Failed to sync messages for conversation ${conv.id}:`, error.message);
        }
      }

      await page.update({ last_synced_at: new Date() });

      return {
        success: true,
        page_id: facebookPageId,
        sync_results: results,
        synced_at: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to perform full sync: ${error.message}`);
    }
  }
}

module.exports = new FacebookSyncService();

