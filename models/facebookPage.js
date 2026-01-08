const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('FacebookPage', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      facebook_account_id: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
    page_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    page_access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    about: DataTypes.TEXT,
    description: DataTypes.TEXT,
    website: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    picture_url: DataTypes.TEXT,
    cover_url: DataTypes.TEXT,
    instagram_business_account: {
        type: DataTypes.JSON,
        comment: 'Linked Instagram Business Account details'
    },
    tasks: {
        type: DataTypes.JSON,
        comment: 'List of tasks/permissions the user has on this page'
    },
      fan_count: DataTypes.INTEGER,
      followers_count: DataTypes.INTEGER,
      is_subscribed: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
      },
      status: {
          type: DataTypes.ENUM('active', 'inactive'),
          defaultValue: 'active'
      },
      last_synced_at: DataTypes.DATE
  }, {
      tableName: 'facebook_pages',
      timestamps: true,
      underscored: true
  });
};
