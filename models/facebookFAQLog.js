const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookFAQLog = sequelize.define('FacebookFAQLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_faq_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facebook_faqs',
        key: 'id'
      }
    },
    facebook_conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'facebook_conversations',
        key: 'id'
      }
    },
    user_feedback: {
      type: DataTypes.ENUM('helpful', 'unhelpful', 'none'),
      defaultValue: 'none'
    },
    message_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Facebook message ID that triggered this FAQ'
    },
    triggered_by_keyword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Which keyword triggered this FAQ'
    }
  }, {
    tableName: 'facebook_faq_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['facebook_faq_id', 'created_at']
      }
    ]
  });

  return FacebookFAQLog;
};

