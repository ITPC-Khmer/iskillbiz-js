const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookAutomation = sequelize.define('FacebookAutomation', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'comment_to_message',
        'away_message',
        'unanswered_alert',
        'custom_keyword',
        'contact_info'
      ),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    config: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuration specific to automation type'
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
    tableName: 'facebook_automations',
    timestamps: true,
    underscored: true
  });

  return FacebookAutomation;
};

