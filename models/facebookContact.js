const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FacebookContact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    facebook_page_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    facebook_user_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING(50),
    profile_pic: DataTypes.TEXT,
    last_interaction: DataTypes.DATE,
    notes: DataTypes.TEXT
  }, {
    tableName: 'facebook_contacts',
    timestamps: true,
    underscored: true
  });
};

