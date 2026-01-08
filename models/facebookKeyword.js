const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookKeyword', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_automation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    keyword: {
      type: DataTypes.VARCHAR(255),
      allowNull: false
    },
    match_type: {
      type: DataTypes.ENUM('exact', 'contains', 'starts_with', 'ends_with', 'regex'),
      defaultValue: 'contains'
    },
    response_message: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'facebook_keywords',
    timestamps: true,
    underscored: true
  });
};

