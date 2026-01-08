const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookPage = sequelize.define('FacebookPage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facebook_accounts',
        key: 'id'
      }
    },
    page_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    page_access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    picture_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fan_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'facebook_pages',
    timestamps: true,
    underscored: true
  });

  return FacebookPage;
};

