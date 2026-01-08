const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookFAQLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_faq_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    facebook_message_id: {
      type: DataTypes.STRING, // Use STRING for ID
      allowNull: true // Might be null if manually tested?
    },
    is_resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    feedback_rating: {
      type: DataTypes.INTEGER, // 1-5 or -1/1
      allowNull: true
    }
  }, {
    tableName: 'facebook_faq_logs',
    timestamps: true,
    underscored: true
  });
};

