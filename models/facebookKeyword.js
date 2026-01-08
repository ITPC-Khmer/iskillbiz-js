const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookKeyword = sequelize.define('FacebookKeyword', {
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
    keyword: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    match_type: {
      type: DataTypes.ENUM('exact', 'contains', 'starts_with', 'ends_with', 'regex'),
      defaultValue: 'contains'
    },
    response_message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    match_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'facebook_keywords',
    timestamps: true,
    underscored: true
  });

  return FacebookKeyword;
};

