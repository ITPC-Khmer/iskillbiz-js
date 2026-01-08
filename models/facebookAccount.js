const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookAccount = sequelize.define('FacebookAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    facebook_user_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'revoked'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'facebook_accounts',
    timestamps: true,
    underscored: true
  });

  return FacebookAccount;
};

