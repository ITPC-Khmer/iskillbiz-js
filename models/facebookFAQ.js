const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookFAQ', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question: DataTypes.TEXT,
    answer: DataTypes.TEXT,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    locale: {
      type: DataTypes.STRING(10),
      defaultValue: 'en_US'
    }
  }, {
    tableName: 'facebook_faqs',
    timestamps: true,
    underscored: true
  });
};

