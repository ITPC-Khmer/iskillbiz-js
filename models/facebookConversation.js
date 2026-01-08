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
      type: DataTypes.VARCHAR(255),
      allowNull: false,
      unique: true
    },
    participant_name: DataTypes.VARCHAR(255),
    participant_id: DataTypes.VARCHAR(255),
    link: DataTypes.VARCHAR(255),
    updated_time: DataTypes.DATE,
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    message_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_message_text: DataTypes.TEXT, // Snippet
    is_answred: { // Typo in migration? Better check.
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'facebook_conversations',
    timestamps: true,
    underscored: true
  });
};

