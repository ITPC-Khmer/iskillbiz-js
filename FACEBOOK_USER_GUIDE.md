# Facebook Integration - Complete Setup Guide

## 🚀 Quick Start Guide

### Step 1: Login to Your Account
1. Navigate to your application (e.g., `http://localhost:5173`)
2. Login with your credentials
3. Click on **Facebook** in the sidebar navigation

---

## 📘 Connect Facebook Account

### Prerequisites
You need a **Facebook Page Access Token** with the following permissions:
- `pages_messaging` - Send and receive messages
- `pages_manage_metadata` - Manage page settings
- `pages_read_engagement` - Read page engagement data
- `pages_show_list` - List pages you manage
- `pages_manage_posts` - Manage page posts/comments

### How to Get Your Access Token

#### Option 1: Facebook Graph API Explorer (Recommended for Testing)
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your Facebook App from the dropdown
3. Click **Get User Access Token**
4. Select the required permissions:
   - `pages_messaging`
   - `pages_manage_metadata`
   - `pages_read_engagement`
   - `pages_show_list`
   - `pages_manage_posts`
5. Click **Generate Access Token**
6. Click **Get Page Access Token** and select your page
7. Copy the token

#### Option 2: Facebook App Dashboard (Production)
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create or select your app
3. Add **Messenger** product to your app
4. Go to **Settings** → **Basic** and get your App ID and Secret
5. Use OAuth flow to get a Page Access Token
6. Request the required permissions during OAuth

### Connect in the App
1. Navigate to `/facebook` in your app
2. Find the **Connect Facebook Account** card
3. Paste your Page Access Token in the input field
4. Click **Connect**
5. You should see "Facebook account connected" notification
6. Click **Refresh** to see your connected accounts

---

## 📄 Sync Facebook Pages

### After Connecting
1. In the **Connect Facebook Account** section, you'll see your connected accounts
2. Each account shows:
   - **Name** - Your Facebook name
   - **Email** - Account email
   - **Status** - Connection status (active/expired)
3. Click **Sync pages** for each account
4. Your pages will appear in the **Pages** card

### Managing Pages
1. **Pages Card** shows all synced pages
2. Click **Reload** to refresh the list
3. Click **Select** to choose a page (loads conversations, contacts, automations)
4. Click **Sync** to sync that specific page (quick sync)
5. Use **Full Sync** button (top right) for complete data sync

---

## 💬 Managing Conversations & Messages

### Load Conversations
1. Select a page first
2. In **Conversations** card, click:
   - **Load** - Get all conversations
   - **Unanswered** - Get unanswered conversations (24h default)
   - **Check** - Custom hours check (set hours in input field)
   - **Sync** - Sync conversations from Facebook

### View & Send Messages
1. Click **Open** on any conversation
2. Messages appear in the **Messages** card
3. Click **Sync messages** to refresh
4. Type a message in the input box at the bottom
5. Click **Send** (requires valid participant_id in conversation)

### Message Features
- Messages from your page are highlighted in blue
- Shows sender name and timestamp
- Auto-scrollable message list
- Real-time sync with Facebook

---

## 👥 Managing Contacts

### View Contacts
1. Select a page
2. In **Contacts** card, click **Load**
3. View all contacts with:
   - Name or Facebook User ID
   - Email (if available)
   - Last interaction time

### Contact Information
- Contacts are automatically synced when you sync conversations
- Each conversation participant is stored as a contact
- Update contact info via API (email, phone, custom fields, tags, notes)

---

## 🤖 Facebook Automations

### Automation Types

#### 1. Comment to Message
**Purpose:** Auto-send DM when someone comments on your post

**Setup:**
1. Type: Select "Comment to message"
2. Name: e.g., "Comment Reply"
3. Message: Your auto-reply message
4. Active: Check the box
5. Click **Create**

#### 2. Away Message
**Purpose:** Auto-reply when you're offline/away

**Setup:**
1. Type: Select "Away message"
2. Name: e.g., "Out of Office"
3. Message: "Thanks for contacting us! We're currently away and will respond shortly."
4. Active: Check the box
5. Click **Create**

#### 3. Identify Unanswered Messages
**Purpose:** Alert/track messages not answered within X hours

**Setup:**
1. Type: Select "Identify unanswered"
2. Name: e.g., "24h Unanswered Alert"
3. Hours threshold: 24 (or custom)
4. Active: Check the box
5. Click **Create**

**Usage:**
- Use the **Check** button in Conversations with hours input
- Shows conversations unanswered for that duration

#### 4. Custom Keywords
**Purpose:** Auto-reply when specific keywords are detected

**Setup:**
1. Type: Select "Custom keywords"
2. Name: e.g., "Pricing Keywords"
3. Message: Base message (optional)
4. Active: Check the box
5. Click **Create**

**Add Keywords:**
1. After creation, find the automation in the list
2. In the keyword input fields:
   - **Keyword:** e.g., "price", "cost", "pricing"
   - **Match type:** 
     - `exact` - Exact match only
     - `contains` - Contains keyword anywhere
     - `starts_with` - Message starts with keyword
     - `ends_with` - Message ends with keyword
     - `regex` - Regular expression pattern
   - **Response message:** "Our pricing starts at $99/month. Visit example.com/pricing"
3. Click **Add keyword**
4. Repeat for multiple keywords

#### 5. Contact Information Request
**Purpose:** Auto-request contact info (email, phone)

**Setup:**
1. Type: Select "Contact info"
2. Name: e.g., "Request Email"
3. Message: "To provide better service, could you share your email?"
4. Active: Check the box
5. Click **Create**

### Managing Automations
- **Active checkbox:** Toggle automation on/off without deleting
- **Delete button:** Permanently remove automation
- **Refresh:** Reload automations list
- Each automation shows its type and current status

---

## 🔄 Sync Options

### Quick Sync (Per Page)
- Click **Sync** next to a specific page
- Syncs: Page details, conversations, contacts
- Faster, use for regular updates

### Full Sync (Complete)
- Click **Full Sync** button (top right)
- Syncs: Everything from Facebook to system
  - Page details (name, category, followers)
  - All conversations
  - All messages per conversation
  - All contacts
- Use when: First setup, major changes, data inconsistency
- Takes longer but ensures complete data

### Sync Conversations
- Click **Sync** in Conversations card
- Pulls latest conversations from Facebook
- Updates unread counts, last message, answered status

### Sync Messages
- Click **Sync msgs** or **Sync messages**
- Pulls latest messages for that conversation
- Updates message list in real-time

---

## 🎯 Complete Workflow Example

### Initial Setup
1. **Login** to your app
2. Go to `/facebook`
3. **Connect Facebook Account:**
   - Get Page Access Token from Graph API Explorer
   - Paste token
   - Click **Connect**
   - Click **Refresh** to see accounts
4. **Sync Pages:**
   - Click **Sync pages** for each account
   - Click **Reload** in Pages card
5. **Select a Page:**
   - Click **Select** on your desired page

### Daily Operations
1. **Check Conversations:**
   - Click **Load** or **Unanswered**
   - Review unread/unanswered messages
2. **Reply to Messages:**
   - Click **Open** on conversation
   - Type reply in input box
   - Click **Send**
3. **Check Contacts:**
   - Click **Load** in Contacts
   - View customer information

### Setting Up Automations
1. **Away Message:**
   ```
   Type: Away message
   Name: After Hours
   Message: Thanks for reaching out! We're currently offline. Our business hours are 9AM-5PM EST. We'll respond as soon as we're back!
   Active: ✓
   ```

2. **Custom Keywords - Pricing:**
   ```
   Type: Custom keywords
   Name: Pricing Inquiries
   
   Keywords:
   - price/contains → "Our plans start at $99/month"
   - cost/contains → "Visit example.com/pricing for details"
   - pricing/contains → "We offer flexible pricing. Chat with us!"
   ```

3. **Unanswered Alert:**
   ```
   Type: Identify unanswered
   Name: 24h Check
   Hours threshold: 24
   Active: ✓
   ```
   Then use **Check** button with hours=24

---

## 🔧 Troubleshooting

### Issue: "No pages found"
**Solution:**
1. Refresh accounts (click **Refresh**)
2. Click **Sync pages** for each account
3. Click **Reload** in Pages card
4. If still empty, reconnect with a new token

### Issue: "Conversations not loading"
**Solution:**
1. Ensure a page is selected (blue border)
2. Click **Load** or **Sync** in Conversations
3. Check if page has any conversations on Facebook
4. Try **Full Sync** for complete refresh

### Issue: "Cannot send message"
**Solution:**
1. Ensure conversation has a valid `participant_id`
2. Check token has `pages_messaging` permission
3. Verify page access token is still valid
4. Re-sync the conversation

### Issue: "Automation not working"
**Solution:**
1. Check **Active** checkbox is enabled
2. Click **Refresh** to reload automations
3. Verify message/config fields are filled
4. For keywords, ensure at least one keyword is added
5. Test by sending a matching message to your page

### Issue: "Token expired"
**Solution:**
1. Account status shows "expired"
2. Get a new Page Access Token
3. Reconnect account with new token
4. Sync pages again

---

## 📊 API Endpoints Reference

### Accounts
- `POST /api/facebook/connect` - Connect account
- `GET /api/facebook/accounts` - List accounts

### Pages
- `POST /api/facebook/accounts/:accountId/sync-pages` - Sync pages
- `GET /api/facebook/pages` - List pages
- `POST /api/facebook/pages/:pageId/full-sync-from-facebook` - Full sync

### Conversations
- `POST /api/facebook/pages/:pageId/sync-conversations` - Sync conversations
- `GET /api/facebook/pages/:pageId/conversations` - List conversations
- `GET /api/facebook/pages/:pageId/conversations/unanswered?hours=24` - Unanswered
- `POST /api/facebook/pages/:pageId/send-message` - Send message

### Messages
- `POST /api/facebook/conversations/:convId/sync-messages` - Sync messages
- `GET /api/facebook/conversations/:convId/messages` - List messages

### Automations
- `POST /api/facebook/pages/:pageId/automations` - Create automation
- `GET /api/facebook/pages/:pageId/automations` - List automations
- `PUT /api/facebook/automations/:autoId` - Update automation
- `DELETE /api/facebook/automations/:autoId` - Delete automation

### Keywords
- `POST /api/facebook/automations/:autoId/keywords` - Add keyword
- `GET /api/facebook/automations/:autoId/keywords` - List keywords

### Contacts
- `GET /api/facebook/pages/:pageId/contacts` - List contacts

---

## 🎨 UI Components Reference

### Cards Layout
```
┌─────────────────────────────────────────────┐
│ Header (Refresh Pages | Full Sync)          │
├─────────────┬─────────────┬─────────────────┤
│   Pages     │ Conversations│   Messages      │
│             │              │                 │
│  - Select   │  - Load      │  - Sync msgs   │
│  - Sync     │  - Unanswered│  - Send box    │
│             │  - Check     │                 │
│             │  - Sync      │                 │
├─────────────┼──────────────┼─────────────────┤
│  Contacts   │ Connect Acct │                 │
│             │              │                 │
│  - Load     │  - Token     │                 │
│             │  - Connect   │                 │
│             │  - Accounts  │                 │
├─────────────┴──────────────┴─────────────────┤
│          Automations (Full Width)            │
│                                              │
│  Create Form | Automation List              │
│  - Type      | - Active toggle              │
│  - Name      | - Delete                     │
│  - Message   | - Keywords (for custom)      │
│  - Config    |                              │
└──────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Logged in to app
- [ ] Navigated to `/facebook`
- [ ] Connected Facebook account with valid token
- [ ] Refreshed accounts list
- [ ] Synced pages for account
- [ ] Selected a page
- [ ] Loaded conversations
- [ ] Viewed messages in a conversation
- [ ] Sent a test message
- [ ] Loaded contacts
- [ ] Created at least one automation
- [ ] Tested keyword automation (if applicable)
- [ ] Verified all data is syncing correctly

---

## 📚 Additional Resources

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Messenger Platform Permissions](https://developers.facebook.com/docs/permissions/reference)
- [Page Access Tokens Guide](https://developers.facebook.com/docs/pages/access-tokens)
- [Webhook Setup](https://developers.facebook.com/docs/messenger-platform/webhooks)

---

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify token permissions and expiry
3. Ensure backend server is running (`npm start`)
4. Check backend logs for API errors
5. Try disconnecting and reconnecting
6. Use **Full Sync** to reset data

---

**Last Updated:** January 8, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready

