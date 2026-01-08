const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookInstantReply = sequelize.define('FacebookInstantReply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_automation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facebook_automations',
        key: 'id'
      }
    },
    trigger: {
      type: DataTypes.ENUM('new_message', 'new_conversation', 'specific_time'),
      allowNull: false,
      defaultValue: 'new_message'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delay_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Delay before sending reply in seconds'
    },
    include_name: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Include customer name in message'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    trigger_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_triggered_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'facebook_instant_replies',
    timestamps: true,
    underscored: true
  });

  return FacebookInstantReply;
};

