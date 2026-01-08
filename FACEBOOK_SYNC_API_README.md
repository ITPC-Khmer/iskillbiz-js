# Facebook Sync API - System ↔ Facebook Integration

## Overview

The Facebook Sync API enables bidirectional synchronization between your system and Facebook pages. You can:
- **Sync FROM Facebook TO System** - Pull latest data from Facebook pages
- **Sync FROM System TO Facebook** - Push updates from your system to Facebook
- **Full Sync** - Comprehensive synchronization of all data

## Features

### Sync FROM Facebook → System
- ✅ Sync page details (name, category, about, fan count)
- ✅ Sync all messages from conversations
- ✅ Sync all contacts/participants
- ✅ Sync conversation status and unread counts
- ✅ Full page data sync

### Sync FROM System → Facebook
- ✅ Update page details (about, phone, website)
- ✅ Archive conversations
- ✅ Mute conversations
- ✅ Mark conversations as read
- ✅ Update contact information locally

## API Endpoints

### 1. Sync Page Details FROM Facebook TO System

```http
POST /api/facebook/pages/:pageId/sync-from-facebook
Authorization: Bearer {token}
```

**Description:** Pulls the latest page details from Facebook and updates them in your system.

**Response:**
```json
{
  "success": true,
  "page": {
    "id": 1,
    "name": "My Business Page",
    "category": "Local Business",
    "about": "Page description",
    "fan_count": 1250,
    "synced_at": "2026-01-08T10:30:00Z"
  }
}
```

---

### 2. Sync Messages FROM Facebook TO System

```http
POST /api/facebook/conversations/:conversationId/sync-messages-from-facebook
Authorization: Bearer {token}
```

**Description:** Syncs all messages from a specific conversation on Facebook to your system.

**Response:**
```json
{
  "success": true,
  "synced_count": 15,
  "messages": [
    {
      "id": 1,
      "facebook_message_id": "m.123456",
      "created": true,
      "from": "John Doe"
    }
  ]
}
```

---

### 3. Sync Contacts FROM Facebook TO System

```http
POST /api/facebook/pages/:pageId/sync-contacts-from-facebook
Authorization: Bearer {token}
```

**Description:** Syncs all contacts (conversation participants) from Facebook to your system.

**Response:**
```json
{
  "success": true,
  "synced_count": 8,
  "contacts": [
    {
      "id": 1,
      "name": "John Doe",
      "facebook_id": "123456789",
      "created": true
    }
  ]
}
```

---

### 4. Update Page Details FROM System TO Facebook

```http
PUT /api/facebook/pages/:pageId/update-to-facebook
Authorization: Bearer {token}
Content-Type: application/json

{
  "about": "Updated page description",
  "phone": "+1-234-567-8900",
  "website": "https://example.com"
}
```

**Description:** Updates page information on Facebook from your system.

**Response:**
```json
{
  "success": true,
  "message": "Page updated successfully",
  "updated_fields": ["about", "phone"]
}
```

---

### 5. Sync Conversation Status FROM Facebook TO System

```http
POST /api/facebook/conversations/:conversationId/sync-status-from-facebook
Authorization: Bearer {token}
```

**Description:** Gets the latest status of a conversation from Facebook (unread count, etc.).

**Response:**
```json
{
  "success": true,
  "unread_count": 3,
  "synced_at": "2026-01-08T10:30:00Z"
}
```

---

### 6. Archive Conversation FROM System TO Facebook

```http
POST /api/facebook/conversations/:conversationId/archive-on-facebook
Authorization: Bearer {token}
```

**Description:** Archives a conversation on Facebook.

**Response:**
```json
{
  "success": true,
  "message": "Conversation archived"
}
```

---

### 7. Mute Conversation FROM System TO Facebook

```http
POST /api/facebook/conversations/:conversationId/mute-on-facebook
Authorization: Bearer {token}
Content-Type: application/json

{
  "mute_until": "PERMANENTLY"
}
```

**Mute Options:**
- `PERMANENTLY` - Mute forever
- Unix timestamp (e.g., `1673510400`) - Mute until specific time

**Response:**
```json
{
  "success": true,
  "message": "Conversation muted until PERMANENTLY"
}
```

---

### 8. Mark Conversation as Read FROM System TO Facebook

```http
POST /api/facebook/conversations/:conversationId/mark-read-on-facebook
Authorization: Bearer {token}
```

**Description:** Marks a conversation as read on Facebook.

**Response:**
```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

---

### 9. Update Contact in System

```http
PUT /api/facebook/contacts/:contactId/update-in-system
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "john@example.com",
  "phone": "+1-234-567-8900",
  "custom_fields": {
    "company": "ABC Corp",
    "location": "New York"
  },
  "tags": ["vip", "customer"],
  "notes": "Important customer notes"
}
```

**Description:** Updates contact information in your system.

**Response:**
```json
{
  "success": true,
  "contact": {
    "id": 1,
    "name": "Updated Name",
    "email": "john@example.com",
    "phone": "+1-234-567-8900"
  }
}
```

---

### 10. Get Sync Status

```http
GET /api/facebook/pages/:pageId/sync-status
Authorization: Bearer {token}
```

**Description:** Gets the current sync status and statistics for a page.

**Response:**
```json
{
  "success": true,
  "page": {
    "id": 1,
    "name": "My Business Page",
    "status": "active",
    "last_synced_at": "2026-01-08T10:30:00Z"
  },
  "statistics": {
    "total_conversations": 45,
    "total_contacts": 32,
    "last_sync": "2026-01-08T10:30:00Z"
  }
}
```

---

### 11. Full Sync - Everything FROM Facebook TO System

```http
POST /api/facebook/pages/:pageId/full-sync-from-facebook
Authorization: Bearer {token}
```

**Description:** Performs a comprehensive sync of all data from Facebook to your system (page details, contacts, conversations, and messages).

**Response:**
```json
{
  "success": true,
  "page_id": 1,
  "sync_results": {
    "page_details": {
      "success": true,
      "page": {
        "id": 1,
        "name": "My Business Page",
        "fan_count": 1250,
        "synced_at": "2026-01-08T10:30:00Z"
      }
    },
    "contacts": {
      "success": true,
      "synced_count": 15
    },
    "conversations": [
      {
        "id": 1,
        "messages_synced": 25
      },
      {
        "id": 2,
        "messages_synced": 18
      }
    ]
  },
  "synced_at": "2026-01-08T10:30:00Z"
}
```

---

## Usage Examples

### Example 1: Sync All Data From Facebook

```javascript
// Full sync from Facebook to system
const response = await fetch(`/api/facebook/pages/1/full-sync-from-facebook`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
console.log(`Synced ${result.sync_results.contacts.synced_count} contacts`);
console.log(`Synced ${result.sync_results.conversations.length} conversations`);
```

### Example 2: Update Page Info to Facebook

```javascript
// Update page details on Facebook
const response = await fetch(`/api/facebook/pages/1/update-to-facebook`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    about: 'We provide excellent customer service 24/7',
    phone: '+1-800-555-0123',
    website: 'https://mybusiness.com'
  })
});

const result = await response.json();
console.log('Fields updated:', result.updated_fields);
```

### Example 3: Sync Specific Conversation Messages

```javascript
// Sync messages from specific conversation
const response = await fetch(
  `/api/facebook/conversations/1/sync-messages-from-facebook`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const result = await response.json();
console.log(`Synced ${result.synced_count} messages`);
```

### Example 4: Archive Multiple Conversations

```javascript
// Archive conversations
const conversationIds = [1, 2, 3, 4, 5];

for (const convId of conversationIds) {
  await fetch(`/api/facebook/conversations/${convId}/archive-on-facebook`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

console.log('All conversations archived');
```

### Example 5: Sync and Update Contacts

```javascript
// 1. Sync contacts from Facebook
const syncRes = await fetch(`/api/facebook/pages/1/sync-contacts-from-facebook`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});

const syncResult = await syncRes.json();
const contacts = syncResult.contacts;

// 2. Update specific contact with additional info
const contactId = contacts[0].id;
const updateRes = await fetch(`/api/facebook/contacts/${contactId}/update-in-system`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'customer@example.com',
    tags: ['new_customer', 'interested'],
    notes: 'Contacted via Facebook messenger'
  })
});

console.log('Contact updated with additional info');
```

---

## Sync Strategy

### Real-time Sync
For real-time synchronization, use webhooks:
```javascript
// Webhook automatically triggers when:
// - New message received
// - Conversation status changes
// - Contact interacts with page
```

### Periodic Sync
Schedule regular syncs using cron jobs:
```javascript
// Every 15 minutes - sync new messages
cron.schedule('*/15 * * * *', async () => {
  const pages = await FacebookPage.findAll();
  for (const page of pages) {
    await facebookSyncService.syncContactsFromFacebook(page.id);
  }
});

// Once daily - full sync
cron.schedule('0 2 * * *', async () => {
  const pages = await FacebookPage.findAll();
  for (const page of pages) {
    await facebookSyncService.fullSyncFromFacebook(page.id);
  }
});
```

### Manual Sync
Users can manually trigger sync via API:
```javascript
// Manual full sync when user clicks button
await fetch(`/api/facebook/pages/${pageId}/full-sync-from-facebook`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Sync Direction Reference

| Operation | Direction | Endpoint |
|-----------|-----------|----------|
| Sync Page Details | ← (Facebook → System) | `POST /pages/:pageId/sync-from-facebook` |
| Sync Messages | ← (Facebook → System) | `POST /conversations/:convId/sync-messages-from-facebook` |
| Sync Contacts | ← (Facebook → System) | `POST /pages/:pageId/sync-contacts-from-facebook` |
| Sync Status | ← (Facebook → System) | `POST /conversations/:convId/sync-status-from-facebook` |
| Update Page Info | → (System → Facebook) | `PUT /pages/:pageId/update-to-facebook` |
| Archive Conversation | → (System → Facebook) | `POST /conversations/:convId/archive-on-facebook` |
| Mute Conversation | → (System → Facebook) | `POST /conversations/:convId/mute-on-facebook` |
| Mark as Read | → (System → Facebook) | `POST /conversations/:convId/mark-read-on-facebook` |
| Update Contact | ← (Update in System) | `PUT /contacts/:contactId/update-in-system` |
| Get Sync Status | ← (System Status) | `GET /pages/:pageId/sync-status` |
| Full Sync | ← (Facebook → System) | `POST /pages/:pageId/full-sync-from-facebook` |

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

Common errors:
- `404` - Page/Conversation/Contact not found
- `403` - Unauthorized (user doesn't own this page)
- `400` - Invalid request parameters
- `500` - Facebook API error or server error

---

## Best Practices

1. **Use Full Sync Sparingly** - Only when you need everything synced
2. **Sync in Background** - Don't wait for sync to complete in UI
3. **Batch Updates** - Update multiple items at once if possible
4. **Monitor Sync Status** - Check `last_synced_at` before syncing again
5. **Handle Errors Gracefully** - Retry failed syncs with exponential backoff
6. **Log All Syncs** - Keep audit trail of what was synced

---

## Rate Limiting

- Full sync: Maximum once every 5 minutes per page
- Individual syncs: Maximum 10 per minute per page
- No limit on read operations (get, status checks)

---

## Future Enhancements

- Conflict resolution when data differs
- Selective field sync
- Sync scheduling UI
- Sync history/logs
- Automatic retry on failure
- Sync progress tracking

