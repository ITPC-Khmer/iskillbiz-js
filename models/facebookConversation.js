const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookConversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    conversation_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    participant_name: DataTypes.STRING,
    participant_id: DataTypes.STRING,
    link: DataTypes.STRING,
    updated_time: DataTypes.DATE,
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    message_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_message_time: DataTypes.DATE,
    last_message_text: DataTypes.TEXT, // Snippet
    is_answered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    can_reply: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether the page can reply to this conversation (24h window)'
    },
    subject: {
      type: DataTypes.STRING,
      comment: 'Conversation subject if applicable'
    },
    tags: {
      type: DataTypes.JSON,
      comment: 'JSON array of tags or labels'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Internal notes for this conversation'
    },
    participants_data: {
      type: DataTypes.JSON,
      comment: 'Full JSON data of participants'
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted', 'spam'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'facebook_conversations',
    timestamps: true,
    underscored: true
  });
};
