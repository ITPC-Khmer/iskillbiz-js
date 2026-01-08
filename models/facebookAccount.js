const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.CHAR(36), // Following UUID format
      allowNull: false
    },
    facebook_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    token_expires_at: DataTypes.DATE,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'expired', 'revoked'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'facebook_accounts',
    timestamps: true,
    underscored: true
  });
};

