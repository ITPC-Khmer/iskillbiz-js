const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookInstantReply', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'facebook_instant_replies',
    timestamps: true,
    underscored: true
  });
};

