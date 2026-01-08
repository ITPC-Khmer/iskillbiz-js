const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookMessage = sequelize.define('FacebookMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facebook_conversations',
        key: 'id'
      }
    },
    message_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    from_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    from_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_from_page: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    has_attachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'facebook_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['facebook_conversation_id', 'created_time']
      }
    ]
  });

  return FacebookMessage;
};

