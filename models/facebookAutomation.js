const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookAutomation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('comment_to_message', 'away_message', 'unanswered_alert', 'custom_keyword', 'contact_info'),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    config: DataTypes.JSON // Stores message, hours_threshold, etc.
  }, {
    tableName: 'facebook_automations',
    timestamps: true,
    underscored: true
  });
};

