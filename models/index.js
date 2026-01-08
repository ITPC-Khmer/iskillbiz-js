require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'iskillbiz';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false
});

const db = {};
db.sequelize = sequelize;
db.User = require('./user')(sequelize);
db.Role = require('./role')(sequelize);
db.Permission = require('./permission')(sequelize);
db.UserRole = require('./userRole')(sequelize);
db.RolePermission = require('./rolePermission')(sequelize);

// Facebook Models
db.FacebookAccount = require('./facebookAccount')(sequelize);
db.FacebookPage = require('./facebookPage')(sequelize);
db.FacebookConversation = require('./facebookConversation')(sequelize);
db.FacebookMessage = require('./facebookMessage')(sequelize);
db.FacebookAutomation = require('./facebookAutomation')(sequelize);
db.FacebookKeyword = require('./facebookKeyword')(sequelize);
db.FacebookContact = require('./facebookContact')(sequelize);
db.FacebookInstantReply = require('./facebookInstantReply')(sequelize);
db.FacebookFAQ = require('./facebookFAQ')(sequelize);
db.FacebookFAQLog = require('./facebookFAQLog')(sequelize);

// Associations
// Users <-> Roles
const { User, Role, Permission, FacebookAccount, FacebookPage, FacebookConversation, FacebookMessage, FacebookAutomation, FacebookKeyword, FacebookContact, FacebookInstantReply, FacebookFAQ, FacebookFAQLog } = db;
User.belongsToMany(Role, { through: db.UserRole, foreignKey: 'user_id' });
Role.belongsToMany(User, { through: db.UserRole, foreignKey: 'role_id' });

// Roles <-> Permissions
Role.belongsToMany(Permission, { through: db.RolePermission, foreignKey: 'role_id' });
Permission.belongsToMany(Role, { through: db.RolePermission, foreignKey: 'permission_id' });

// Facebook Associations
// User -> FacebookAccount
User.hasMany(FacebookAccount, { foreignKey: 'user_id', as: 'facebookAccounts' });
FacebookAccount.belongsTo(User, { foreignKey: 'user_id' });

// FacebookAccount -> FacebookPage
FacebookAccount.hasMany(FacebookPage, { foreignKey: 'facebook_account_id', as: 'pages' });
FacebookPage.belongsTo(FacebookAccount, { foreignKey: 'facebook_account_id' });

// FacebookPage -> FacebookConversation
FacebookPage.hasMany(FacebookConversation, { foreignKey: 'facebook_page_id', as: 'conversations' });
FacebookConversation.belongsTo(FacebookPage, { foreignKey: 'facebook_page_id' });

// FacebookConversation -> FacebookMessage
FacebookConversation.hasMany(FacebookMessage, { foreignKey: 'facebook_conversation_id', as: 'messages' });
FacebookMessage.belongsTo(FacebookConversation, { foreignKey: 'facebook_conversation_id' });

// FacebookPage -> FacebookAutomation
FacebookPage.hasMany(FacebookAutomation, { foreignKey: 'facebook_page_id', as: 'automations' });
FacebookAutomation.belongsTo(FacebookPage, { foreignKey: 'facebook_page_id' });

// FacebookAutomation -> FacebookKeyword
FacebookAutomation.hasMany(FacebookKeyword, { foreignKey: 'facebook_automation_id', as: 'keywords', onDelete: 'CASCADE' });
FacebookKeyword.belongsTo(FacebookAutomation, { foreignKey: 'facebook_automation_id' });

// FacebookPage -> FacebookContact
FacebookPage.hasMany(FacebookContact, { foreignKey: 'facebook_page_id', as: 'contacts' });
FacebookContact.belongsTo(FacebookPage, { foreignKey: 'facebook_page_id' });

// FacebookAutomation -> FacebookInstantReply
FacebookAutomation.hasMany(FacebookInstantReply, { foreignKey: 'facebook_automation_id', as: 'instantReplies', onDelete: 'CASCADE' });
FacebookInstantReply.belongsTo(FacebookAutomation, { foreignKey: 'facebook_automation_id' });

// FacebookPage -> FacebookFAQ
FacebookPage.hasMany(FacebookFAQ, { foreignKey: 'facebook_page_id', as: 'faqs' });
FacebookFAQ.belongsTo(FacebookPage, { foreignKey: 'facebook_page_id' });

// FacebookFAQ -> FacebookFAQLog
FacebookFAQ.hasMany(FacebookFAQLog, { foreignKey: 'facebook_faq_id', as: 'logs' });
FacebookFAQLog.belongsTo(FacebookFAQ, { foreignKey: 'facebook_faq_id' });

// FacebookConversation -> FacebookFAQLog
FacebookConversation.hasMany(FacebookFAQLog, { foreignKey: 'facebook_conversation_id', as: 'faqLogs' });
FacebookFAQLog.belongsTo(FacebookConversation, { foreignKey: 'facebook_conversation_id' });

async function initDatabase(sessionStore) {
  await sequelize.authenticate();
  if (sessionStore && typeof sessionStore.sync === 'function') {
    await sessionStore.sync();
  }
  await sequelize.sync();
}

module.exports = {
  ...db,
  initDatabase
};
