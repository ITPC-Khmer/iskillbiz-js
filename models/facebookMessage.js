const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    from_id: DataTypes.STRING,
    from_name: DataTypes.STRING,
    to_data: DataTypes.JSON, // Stores array of recipients
    message: DataTypes.TEXT,
    sticker: {
      type: DataTypes.JSON, // Store sticker URL or ID
      comment: 'Sticker data if present'
    },
    created_time: DataTypes.DATE,
    has_attachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachments: DataTypes.JSON,
    reply_to: {
        type: DataTypes.JSON, // Can store the ID or the summary of the message replied to
        comment: 'Reference to the message being replied to'
    },
    tags: {
        type: DataTypes.JSON,
        comment: 'Message tags for policy enforcement'
    },
    is_from_page: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'facebook_messages',
    timestamps: true,
    underscored: true
  });
};
