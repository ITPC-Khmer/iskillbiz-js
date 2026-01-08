const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookConversation = sequelize.define('FacebookConversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facebook_pages',
        key: 'id'
      }
    },
    conversation_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    participant_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    participant_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    message_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_message_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_message_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_answered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('open', 'closed', 'archived'),
      defaultValue: 'open'
    }
  }, {
    tableName: 'facebook_conversations',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['facebook_page_id', 'is_answered']
      }
    ]
  });

  return FacebookConversation;
};

