const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FacebookContact = sequelize.define('FacebookContact', {
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
    facebook_user_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    profile_pic: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    custom_fields: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_interaction: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'facebook_contacts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['facebook_page_id', 'facebook_user_id']
      }
    ]
  });

  return FacebookContact;
};

