# Database Sync Guide

## ✅ Database Successfully Synced!

All 7 Facebook tables have been created in your database:

1. ✅ `facebook_accounts`
2. ✅ `facebook_automations`
3. ✅ `facebook_contacts`
4. ✅ `facebook_conversations`
5. ✅ `facebook_keywords`
6. ✅ `facebook_messages`
7. ✅ `facebook_pages`

## How Database Sync Works

Your application uses **Sequelize ORM** with automatic synchronization. The database tables are created automatically when the server starts.

### Automatic Sync (Recommended)

Simply start your server and tables are created/updated automatically:

```bash
npm start
```

The `initDatabase()` function in `/models/index.js` runs `sequelize.sync()` which:
- Creates tables if they don't exist
- Does NOT drop existing tables
- Does NOT delete existing data

### Manual Sync Options

#### Option 1: Use the initialization script
```bash
npm run init:facebook
```

#### Option 2: Use the seeding script (creates tables + test data)
```bash
npm run init:facebook:seed
```

#### Option 3: Force sync (⚠️ WARNING: Drops all tables and recreates them)
```javascript
// In models/index.js, change:
await sequelize.sync();

// To:
await sequelize.sync({ force: true }); // ⚠️ DELETES ALL DATA!
```

## Verify Database Tables

### Check if tables exist:
```bash
mysql -u root -p'123456789;;aA' iskillbiz_js -e "SHOW TABLES LIKE 'facebook%';"
```

### View table structure:
```bash
mysql -u root -p'123456789;;aA' iskillbiz_js -e "DESCRIBE facebook_accounts;"
```

### View all tables:
```bash
mysql -u root -p'123456789;;aA' iskillbiz_js -e "SHOW TABLES;"
```

## Current Database Status

✅ Server is running on port: **3032**
✅ Database: **iskillbiz_js**
✅ All Facebook tables created successfully
✅ Foreign keys configured correctly
✅ Indexes applied

## Table Relationships

```
users (existing)
  └── facebook_accounts
        └── facebook_pages
              ├── facebook_conversations
              │     └── facebook_messages
              ├── facebook_automations
              │     └── facebook_keywords
              └── facebook_contacts
```

## Next Steps

1. **Test the API endpoints:**
   ```bash
   # Get health check
   curl http://localhost:3032/api/
   
   # Test Facebook endpoints (requires authentication)
   curl http://localhost:3032/api/facebook/accounts \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Read the documentation:**
   - API Reference: `FACEBOOK_MODULE_README.md`
   - Implementation Details: `FACEBOOK_MODULE_SUMMARY.md`

3. **Configure Facebook App:**
   - Set up webhook at: `https://yourdomain.com/api/facebook/webhook`
   - Use verify token: `iskillbiz_webhook_token_secure_2026`

## Troubleshooting

### If tables aren't created:
1. Check database connection in `.env`
2. Ensure MySQL is running
3. Check server logs for errors
4. Verify models are imported in `/models/index.js`

### If you need to recreate tables:
```sql
-- Drop all Facebook tables
DROP TABLE IF EXISTS facebook_keywords;
DROP TABLE IF EXISTS facebook_messages;
DROP TABLE IF EXISTS facebook_conversations;
DROP TABLE IF EXISTS facebook_contacts;
DROP TABLE IF EXISTS facebook_automations;
DROP TABLE IF EXISTS facebook_pages;
DROP TABLE IF EXISTS facebook_accounts;
```

Then restart the server: `npm start`

## Schema Updates

When you modify models (add/remove columns), you have two options:

### Option 1: Alter mode (safe - preserves data)
```javascript
// In models/index.js
await sequelize.sync({ alter: true });
```

### Option 2: Manual migration
Use Sequelize CLI migrations for production environments.

---

**Database sync is complete and working!** 🎉

Your Facebook module is ready to use. Start making API calls to integrate Facebook messaging into your application.

