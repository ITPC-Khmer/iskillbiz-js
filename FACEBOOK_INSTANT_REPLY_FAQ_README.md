# Facebook Instant Reply & FAQ Module - API Documentation

## Overview

This module extends the Facebook integration with two powerful features:
- **Instant Reply** - Automatically send instant messages when conversations start
- **FAQ** - Manage frequently asked questions and automatically respond to common queries

## New Database Tables

### facebook_instant_replies
Stores instant reply configurations for automations.
- `id` - Primary key
- `facebook_automation_id` - Reference to facebook_automations
- `trigger` - When to send (new_message, new_conversation, specific_time)
- `message` - The message to send
- `delay_seconds` - Delay before sending (0 = immediate)
- `include_name` - Whether to include customer name
- `is_active` - Whether enabled
- `trigger_count` - Times triggered
- `last_triggered_at` - Last trigger time

### facebook_faqs
Stores FAQ entries for a page.
- `id` - Primary key
- `facebook_page_id` - Reference to facebook_pages
- `question` - FAQ question
- `answer` - FAQ answer
- `keywords` - Array of keywords to trigger this FAQ
- `category` - FAQ category
- `order` - Display order
- `is_active` - Whether enabled
- `match_count` - Times this FAQ was sent
- `helpful_count` - Times marked as helpful
- `unhelpful_count` - Times marked as unhelpful
- `last_used_at` - Last time used

### facebook_faq_logs
Logs each time an FAQ is sent and tracks user feedback.
- `id` - Primary key
- `facebook_faq_id` - Reference to facebook_faqs
- `facebook_conversation_id` - Reference to facebook_conversations
- `user_feedback` - helpful, unhelpful, or none
- `message_id` - Facebook message ID that triggered it
- `triggered_by_keyword` - Which keyword matched

## API Endpoints

### Instant Reply Endpoints

#### Create Instant Reply
```http
POST /api/facebook/automations/:automationId/instant-replies
Authorization: Bearer {token}
Content-Type: application/json

{
  "trigger": "new_message",
  "message": "Thank you for contacting us! We will respond shortly.",
  "delay_seconds": 0,
  "include_name": true,
  "is_active": true
}
```

**Trigger Types:**
- `new_message` - When a new message arrives
- `new_conversation` - When a new conversation starts
- `specific_time` - At a specific time (future feature)

#### Get Instant Replies for Automation
```http
GET /api/facebook/automations/:automationId/instant-replies
Authorization: Bearer {token}
```

#### Update Instant Reply
```http
PUT /api/facebook/instant-replies/:replyId
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Updated message",
  "delay_seconds": 5,
  "is_active": false
}
```

#### Delete Instant Reply
```http
DELETE /api/facebook/instant-replies/:replyId
Authorization: Bearer {token}
```

### FAQ Endpoints

#### Create FAQ
```http
POST /api/facebook/pages/:pageId/faqs
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "What is your business hours?",
  "answer": "We are open Monday-Friday 9AM-5PM EST.",
  "keywords": ["hours", "when open", "business hours"],
  "category": "General",
  "order": 1,
  "is_active": true
}
```

#### Get FAQs for Page
```http
GET /api/facebook/pages/:pageId/faqs?category=General&is_active=true
Authorization: Bearer {token}
```

#### Get FAQ by ID
```http
GET /api/facebook/faqs/:faqId
Authorization: Bearer {token}
```

Returns FAQ with all logs and feedback information.

#### Update FAQ
```http
PUT /api/facebook/faqs/:faqId
Authorization: Bearer {token}
Content-Type: application/json

{
  "question": "Updated question",
  "answer": "Updated answer",
  "keywords": ["new", "keywords"],
  "order": 2
}
```

#### Delete FAQ
```http
DELETE /api/facebook/faqs/:faqId
Authorization: Bearer {token}
```

#### Search FAQs by Keywords
```http
GET /api/facebook/pages/:pageId/faqs/search?q=hours
Authorization: Bearer {token}
```

Searches question, answer, and keywords for matches.

#### Send FAQ Answer to Conversation
```http
POST /api/facebook/faqs/:faqId/send/:conversationId
Authorization: Bearer {token}
Content-Type: application/json

{
  "senderId": "facebook_user_id"
}
```

Sends the FAQ answer and logs the interaction.

#### Record FAQ Feedback
```http
POST /api/facebook/faq-logs/:logId/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "feedback": "helpful"
}
```

**Feedback Values:**
- `helpful` - User found helpful
- `unhelpful` - User found unhelpful
- `none` - No feedback

#### Get FAQ Statistics
```http
GET /api/facebook/pages/:pageId/faqs/stats
Authorization: Bearer {token}
```

Returns:
```json
{
  "total_faqs": 10,
  "total_uses": 245,
  "total_helpful": 200,
  "total_unhelpful": 20,
  "faqs_by_category": {
    "General": 5,
    "Pricing": 3,
    "Technical": 2
  },
  "top_faqs": [
    {
      "id": 1,
      "question": "What are your hours?",
      "uses": 85,
      "helpful": 78,
      "unhelpful": 2
    }
  ]
}
```

#### Get FAQ Categories
```http
GET /api/facebook/pages/:pageId/faq-categories
Authorization: Bearer {token}
```

Returns list of all FAQ categories.

#### Bulk Import FAQs
```http
POST /api/facebook/pages/:pageId/faqs/bulk-import
Authorization: Bearer {token}
Content-Type: application/json

{
  "faqs": [
    {
      "question": "How much does it cost?",
      "answer": "$99/month",
      "keywords": ["price", "cost", "pricing"],
      "category": "Pricing",
      "is_active": true
    },
    {
      "question": "Do you offer support?",
      "answer": "Yes, 24/7 support available.",
      "keywords": ["support", "help", "contact"],
      "category": "Support",
      "is_active": true
    }
  ]
}
```

## Usage Examples

### Example 1: Set Up Instant Reply

```javascript
// 1. Create an automation first
const automationRes = await fetch(`/api/facebook/pages/${pageId}/automations`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Instant Reply',
    type: 'instant_reply',
    is_active: true
  })
});

const { automation } = await automationRes.json();

// 2. Create instant reply
const replyRes = await fetch(`/api/facebook/automations/${automation.id}/instant-replies`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trigger: 'new_message',
    message: 'Thanks for contacting us! Someone will respond shortly.',
    delay_seconds: 2,
    include_name: true,
    is_active: true
  })
});

const { reply } = await replyRes.json();
console.log('Instant reply created:', reply);
```

### Example 2: Create and Manage FAQs

```javascript
// 1. Create an FAQ
const faqRes = await fetch(`/api/facebook/pages/${pageId}/faqs`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: 'What are your business hours?',
    answer: 'We are open Monday-Friday 9AM-5PM EST, and Saturday 10AM-2PM EST.',
    keywords: ['hours', 'when open', 'business hours', 'open'],
    category: 'General',
    order: 1,
    is_active: true
  })
});

const { faq } = await faqRes.json();

// 2. Search FAQs by keyword
const searchRes = await fetch(`/api/facebook/pages/${pageId}/faqs/search?q=hours`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { results } = await searchRes.json();
console.log('Found FAQs:', results);

// 3. Send FAQ to customer
const sendRes = await fetch(`/api/facebook/faqs/${faq.id}/send/${conversationId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    senderId: 'facebook_user_id'
  })
});

// 4. Record feedback
const logId = 1; // from the send response
const feedbackRes = await fetch(`/api/facebook/faq-logs/${logId}/feedback`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    feedback: 'helpful'
  })
});
```

### Example 3: Bulk Import FAQs

```javascript
const faqs = [
  {
    question: 'How much does it cost?',
    answer: 'Our basic plan is $99/month. See our pricing page for more details.',
    keywords: ['price', 'cost', 'pricing', 'money'],
    category: 'Pricing',
    is_active: true
  },
  {
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a 14-day free trial. No credit card required.',
    keywords: ['free trial', 'trial', 'free'],
    category: 'Pricing',
    is_active: true
  },
  {
    question: 'How do I contact support?',
    answer: 'Email us at support@example.com or use our in-app chat.',
    keywords: ['contact', 'support', 'help', 'email'],
    category: 'Support',
    is_active: true
  }
];

const bulkRes = await fetch(`/api/facebook/pages/${pageId}/faqs/bulk-import`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ faqs })
});

const { created, count } = await bulkRes.json();
console.log(`${count} FAQs imported successfully`);
```

### Example 4: Get FAQ Analytics

```javascript
const statsRes = await fetch(`/api/facebook/pages/${pageId}/faqs/stats`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { stats } = await statsRes.json();

console.log(`Total FAQs: ${stats.total_faqs}`);
console.log(`Total Uses: ${stats.total_uses}`);
console.log(`Helpful: ${stats.total_helpful} | Unhelpful: ${stats.total_unhelpful}`);
console.log(`Top FAQ: ${stats.top_faqs[0].question}`);
```

## How It Works

### Instant Reply Flow

1. User sends a message to your page
2. Webhook receives the message
3. If instant reply automation is enabled:
   - Check for matching instant reply rule
   - Wait for configured delay (if any)
   - Send reply with optional name inclusion
   - Update trigger count and last triggered time

### FAQ Flow

1. User sends a message
2. System extracts keywords/text
3. Search through active FAQs:
   - Check if message matches FAQ keywords
   - Check if message matches FAQ question/answer text
4. If match found:
   - Send FAQ answer to user
   - Create FAQ log entry
5. User can provide feedback (helpful/unhelpful)
6. Stats updated automatically

## Features

### Instant Reply
- ✅ Multiple trigger types (new message, new conversation)
- ✅ Configurable delay before sending
- ✅ Optional name inclusion
- ✅ Statistics tracking
- ✅ Enable/disable toggle

### FAQ
- ✅ Multiple keywords per FAQ
- ✅ Organized by categories
- ✅ Search and matching
- ✅ User feedback collection
- ✅ Detailed statistics
- ✅ Usage tracking
- ✅ Bulk import
- ✅ Order/sorting support
- ✅ Helpful/unhelpful ratings

## Best Practices

### Instant Replies
1. Keep messages short and friendly
2. Set small delays (0-5 seconds) for immediate-feeling responses
3. Include customer name for personalization
4. Test with different trigger types

### FAQs
1. Use clear, specific keywords
2. Keep answers concise (2-3 sentences max)
3. Organize by meaningful categories
4. Monitor helpful/unhelpful feedback
5. Update based on user feedback
6. Test keyword matching before going live

## Integration with Automations

Both Instant Reply and FAQ can be part of your automation strategy:

```
Message Received
  → Send Instant Reply (immediate acknowledgment)
  → Search FAQs (if relevant keywords found)
  → Track in FAQ logs
  → Collect feedback
  → Update stats
```

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
- 400: Missing required fields
- 404: Resource not found
- 403: Unauthorized access
- 500: Server error

## Rate Limiting

No explicit rate limiting on these endpoints, but:
- Instant reply: max 1 per message
- FAQ: max 3 searches per second per page

## Future Enhancements

Potential features to add:
- Scheduled instant replies (specific_time trigger)
- AI-powered FAQ matching
- Multi-language FAQ support
- FAQ rating system (stars)
- FAQ related questions suggestions
- Webhook integration for external FAQ sources

