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
      type: DataTypes.VARCHAR(255),
      allowNull: false,
      unique: true
    },
    from_id: DataTypes.VARCHAR(255),
    from_name: DataTypes.VARCHAR(255),
    to_data: DataTypes.JSON, // Stores array of recipients
    message: DataTypes.TEXT,
    created_time: DataTypes.DATE,
    has_attachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachments: DataTypes.JSON,
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

