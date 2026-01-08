# Facebook Integration Module - API Documentation

## Overview
This module provides complete Facebook integration for managing Facebook accounts, pages, conversations, messages, contacts, and automations. All Facebook-related tables use the `facebook_` prefix.

## Database Tables

### 1. facebook_accounts
Stores Facebook account connections for users.
- `id` - Primary key
- `user_id` - Reference to Users table
- `facebook_user_id` - Facebook user ID (unique)
- `access_token` - Facebook access token
- `token_expires_at` - Token expiration date
- `name` - User's name
- `email` - User's email
- `status` - Account status (active, expired, revoked)

### 2. facebook_pages
Stores Facebook pages managed by connected accounts.
- `id` - Primary key
- `facebook_account_id` - Reference to facebook_accounts
- `page_id` - Facebook page ID (unique)
- `page_access_token` - Page-specific access token
- `name` - Page name
- `category` - Page category
- `about` - Page description
- `picture_url` - Page profile picture URL
- `fan_count` - Number of followers
- `is_subscribed` - Webhook subscription status
- `status` - Page status (active, inactive)
- `last_synced_at` - Last sync timestamp

### 3. facebook_conversations
Stores Facebook message conversations.
- `id` - Primary key
- `facebook_page_id` - Reference to facebook_pages
- `conversation_id` - Facebook conversation ID (unique)
- `participant_id` - Participant's Facebook ID
- `participant_name` - Participant's name
- `unread_count` - Number of unread messages
- `message_count` - Total messages in conversation
- `last_message_time` - Timestamp of last message
- `last_message_text` - Text of last message
- `is_answered` - Whether conversation has been answered
- `status` - Conversation status (open, closed, archived)

### 4. facebook_messages
Stores individual messages within conversations.
- `id` - Primary key
- `facebook_conversation_id` - Reference to facebook_conversations
- `message_id` - Facebook message ID (unique)
- `from_id` - Sender's Facebook ID
- `from_name` - Sender's name
- `message` - Message text
- `created_time` - Message timestamp
- `is_from_page` - Whether sent by page
- `has_attachments` - Whether message has attachments
- `attachments` - Attachment data (JSON)

### 5. facebook_automations
Stores automation rules for Facebook pages.
- `id` - Primary key
- `facebook_page_id` - Reference to facebook_pages
- `name` - Automation name
- `type` - Automation type (comment_to_message, away_message, unanswered_alert, custom_keyword, contact_info)
- `is_active` - Whether automation is active
- `config` - Configuration data (JSON)
- `trigger_count` - Number of times triggered
- `last_triggered_at` - Last trigger timestamp

### 6. facebook_keywords
Stores custom keyword rules for automations.
- `id` - Primary key
- `facebook_automation_id` - Reference to facebook_automations
- `keyword` - Keyword to match
- `match_type` - Match type (exact, contains, starts_with, ends_with, regex)
- `response_message` - Auto-response message
- `is_active` - Whether keyword is active
- `match_count` - Number of times matched

### 7. facebook_contacts
Stores contact information for Facebook users.
- `id` - Primary key
- `facebook_page_id` - Reference to facebook_pages
- `facebook_user_id` - User's Facebook ID
- `name` - Contact name
- `email` - Contact email
- `phone` - Contact phone
- `profile_pic` - Profile picture URL
- `custom_fields` - Custom fields (JSON)
- `tags` - Contact tags (JSON)
- `notes` - Notes about contact
- `last_interaction` - Last interaction timestamp

## API Endpoints

### Facebook Account Management

#### Connect Facebook Account
```http
POST /api/facebook/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "access_token": "facebook_access_token"
}
```

#### Get User's Facebook Accounts
```http
GET /api/facebook/accounts
Authorization: Bearer {token}
```

### Facebook Pages

#### Sync Pages for an Account
```http
POST /api/facebook/accounts/:accountId/sync-pages
Authorization: Bearer {token}
```

#### Get Pages
```http
GET /api/facebook/pages
Authorization: Bearer {token}
```

### Conversations

#### Sync Conversations for a Page
```http
POST /api/facebook/pages/:pageId/sync-conversations
Authorization: Bearer {token}
```

#### Get Conversations for a Page
```http
GET /api/facebook/pages/:pageId/conversations?status=open&is_answered=false
Authorization: Bearer {token}
```

#### Get Unanswered Conversations
```http
GET /api/facebook/pages/:pageId/conversations/unanswered?hours=24
Authorization: Bearer {token}
```

### Messages

#### Sync Messages for a Conversation
```http
POST /api/facebook/conversations/:conversationId/sync-messages
Authorization: Bearer {token}
```

#### Get Messages for a Conversation
```http
GET /api/facebook/conversations/:conversationId/messages
Authorization: Bearer {token}
```

#### Send Message
```http
POST /api/facebook/pages/:pageId/send-message
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient_id": "facebook_user_id",
  "message": "Your message text"
}
```

### Contacts

#### Get Contacts for a Page
```http
GET /api/facebook/pages/:pageId/contacts
Authorization: Bearer {token}
```

#### Update Contact
```http
PUT /api/facebook/contacts/:contactId
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "custom_fields": {
    "company": "ABC Corp"
  },
  "tags": ["vip", "customer"],
  "notes": "Important customer"
}
```

### Automations

#### Create Automation
```http
POST /api/facebook/pages/:pageId/automations
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Away Message",
  "type": "away_message",
  "is_active": true,
  "config": {
    "message": "Thanks for contacting us! We'll respond soon."
  }
}
```

Automation types:
- `comment_to_message` - Auto-reply to comments via DM
- `away_message` - Send away message when page is offline
- `unanswered_alert` - Alert about unanswered messages
- `custom_keyword` - Respond to custom keywords
- `contact_info` - Request contact information

#### Get Automations for a Page
```http
GET /api/facebook/pages/:pageId/automations
Authorization: Bearer {token}
```

#### Update Automation
```http
PUT /api/facebook/automations/:automationId
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_active": false,
  "config": {
    "message": "Updated message"
  }
}
```

#### Delete Automation
```http
DELETE /api/facebook/automations/:automationId
Authorization: Bearer {token}
```

### Keywords (Custom Keywords Automation)

#### Create Keyword
```http
POST /api/facebook/automations/:automationId/keywords
Authorization: Bearer {token}
Content-Type: application/json

{
  "keyword": "pricing",
  "match_type": "contains",
  "response_message": "Check our pricing at https://example.com/pricing",
  "is_active": true
}
```

Match types:
- `exact` - Exact match
- `contains` - Contains keyword
- `starts_with` - Starts with keyword
- `ends_with` - Ends with keyword
- `regex` - Regular expression match

#### Get Keywords for Automation
```http
GET /api/facebook/automations/:automationId/keywords
Authorization: Bearer {token}
```

#### Update Keyword
```http
PUT /api/facebook/keywords/:keywordId
Authorization: Bearer {token}
Content-Type: application/json

{
  "keyword": "price",
  "response_message": "Updated response"
}
```

#### Delete Keyword
```http
DELETE /api/facebook/keywords/:keywordId
Authorization: Bearer {token}
```

#### Check Unanswered Messages
```http
GET /api/facebook/pages/:pageId/unanswered-check
Authorization: Bearer {token}
```

### Webhook

#### Webhook Verification (Facebook Setup)
```http
GET /api/facebook/webhook?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}
```

#### Webhook Events (Receives from Facebook)
```http
POST /api/facebook/webhook
Content-Type: application/json

{
  "object": "page",
  "entry": [...]
}
```

## Setup Instructions

### 1. Environment Variables
Add to `.env`:
```
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_verify_token
```

### 2. Facebook App Configuration
1. Create a Facebook App at https://developers.facebook.com
2. Add "Messenger" product
3. Set up webhook:
   - Callback URL: `https://yourdomain.com/api/facebook/webhook`
   - Verify Token: Same as `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
   - Subscribe to: `messages`, `messaging_postbacks`, `message_reads`, `message_deliveries`

### 3. Get Access Token
1. Use Facebook Login to authenticate users
2. Request permissions: `pages_manage_metadata`, `pages_messaging`, `pages_read_engagement`
3. Get long-lived access token
4. Send to `/api/facebook/connect` endpoint

### 4. Database Migration
Run migrations to create all Facebook tables:
```bash
npm start
```
The tables will be created automatically on first run.

## Usage Examples

### Example 1: Connect Facebook and Sync Pages
```javascript
// 1. Connect Facebook account
const connectResponse = await fetch('/api/facebook/connect', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    access_token: facebookAccessToken
  })
});

const { account } = await connectResponse.json();

// 2. Sync pages
const syncResponse = await fetch(`/api/facebook/accounts/${account.id}/sync-pages`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken
  }
});

const { pages } = await syncResponse.json();
```

### Example 2: Set Up Away Message
```javascript
const response = await fetch(`/api/facebook/pages/${pageId}/automations`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Away Message',
    type: 'away_message',
    is_active: true,
    config: {
      message: 'Thank you for your message! We are currently away but will respond within 24 hours.'
    }
  })
});
```

### Example 3: Set Up Custom Keywords
```javascript
// 1. Create custom_keyword automation
const automationResponse = await fetch(`/api/facebook/pages/${pageId}/automations`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Pricing Keyword',
    type: 'custom_keyword',
    is_active: true
  })
});

const { automation } = await automationResponse.json();

// 2. Add keywords
const keywords = [
  { keyword: 'price', match_type: 'contains', response_message: 'Our pricing starts at $99/month' },
  { keyword: 'cost', match_type: 'contains', response_message: 'Our pricing starts at $99/month' },
  { keyword: 'hours', match_type: 'contains', response_message: 'We are open Monday-Friday, 9am-5pm' }
];

for (const kw of keywords) {
  await fetch(`/api/facebook/automations/${automation.id}/keywords`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + userToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(kw)
  });
}
```

### Example 4: Monitor Unanswered Messages
```javascript
// Check for messages unanswered for more than 2 hours
const response = await fetch(`/api/facebook/pages/${pageId}/conversations/unanswered?hours=2`, {
  headers: {
    'Authorization': 'Bearer ' + userToken
  }
});

const { conversations } = await response.json();

// Alert or take action on unanswered conversations
if (conversations.length > 0) {
  console.log(`${conversations.length} unanswered conversations!`);
}
```

## Automation Features

### 1. Comment to Message
Auto-sends a DM when someone comments on your page posts.

### 2. Away Message
Automatically sends a message when someone first contacts your page (useful for off-hours).

### 3. Identify Unanswered Messages
Tracks conversations that haven't been answered within a specified time threshold.

### 4. Custom Keywords
Automatically responds to messages containing specific keywords with pre-defined responses.

### 5. Contact Information
Automatically requests contact information (email, phone) from users during conversations.

## Security Notes

- All endpoints require authentication via Bearer token
- User ownership is verified for all Facebook resources
- Access tokens are stored securely in the database
- Webhook verification token is required for Facebook webhook setup

## Dependencies

- `axios` - HTTP client for Facebook API calls
- `sequelize` - ORM for database operations
- `express` - Web framework
- `jsonwebtoken` - For JWT authentication

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

Success responses:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": {...}
}
```

