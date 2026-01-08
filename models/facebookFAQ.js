const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookFAQ = sequelize.define('FacebookFAQ', {
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of keywords to trigger this FAQ'
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    match_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times this FAQ was triggered'
    },
    helpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of users marked this as helpful'
    },
    unhelpful_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of users marked this as unhelpful'
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'facebook_faqs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['facebook_page_id', 'is_active']
      },
      {
        fields: ['category']
      }
    ]
  });

  return FacebookFAQ;
};

