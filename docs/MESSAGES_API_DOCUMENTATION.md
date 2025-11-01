# Messages API Documentation

## Overview

The Messages API provides endpoints for managing direct messages between users. Each message records the sender, recipient, text content, and read status (timestamp when read, or NULL if unread).

## Message Model

### Message Attributes

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `uuid` | UUID | Unique message identifier | Auto-generated |
| `senderUuid` | UUID | UUID of the message sender | Yes |
| `recipientUuid` | UUID | UUID of the message recipient | Yes |
| `text` | TEXT | Message content | Yes |
| `read` | DATE or NULL | Timestamp when message was read, or NULL if unread | No (default: NULL) |
| `createdAt` | DATE | Message creation timestamp | Auto-generated |
| `updatedAt` | DATE | Last update timestamp | Auto-generated |

### Associations

- `sender` - BelongsTo User (via senderUuid)
- `recipient` - BelongsTo User (via recipientUuid)

## API Endpoints

### 1. Get All Messages

**Endpoint:** `GET /api/messages`

**Description:** Retrieve messages for a specific user (sent or received)

**Query Parameters:**
- `user` (required) - UUID of the user whose messages to fetch
- `with` (optional) - UUID of conversation partner to filter by
- `unreadOnly` (optional) - Set to `true` to get only unread messages
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Messages per page (default: 50)

**Example Request:**
```http
GET /api/messages?user=123e4567-e89b-12d3-a456-426614174000&page=1&limit=20
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "senderUuid": "123e4567-e89b-12d3-a456-426614174000",
        "recipientUuid": "789e0123-e89b-12d3-a456-426614174111",
        "text": "Hello, how are you?",
        "read": "2025-11-01T10:30:00.000Z",
        "createdAt": "2025-11-01T09:00:00.000Z",
        "updatedAt": "2025-11-01T10:30:00.000Z",
        "sender": {
          "uuid": "123e4567-e89b-12d3-a456-426614174000",
          "numeFullName": "John Doe",
          "poza": "https://...",
          "departament": "Engineering",
          "jobTitle": "Senior Developer"
        },
        "recipient": {
          "uuid": "789e0123-e89b-12d3-a456-426614174111",
          "numeFullName": "Jane Smith",
          "poza": "https://...",
          "departament": "Design",
          "jobTitle": "UI Designer"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  },
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

### 2. Get Conversations List

**Endpoint:** `GET /api/messages/conversations`

**Description:** Get a list of all conversations for a user with last message and unread count

**Query Parameters:**
- `user` (required) - UUID of the user

**Example Request:**
```http
GET /api/messages/conversations?user=123e4567-e89b-12d3-a456-426614174000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "partner": {
          "uuid": "789e0123-e89b-12d3-a456-426614174111",
          "numeFullName": "Jane Smith",
          "poza": "https://...",
          "departament": "Design",
          "jobTitle": "UI Designer"
        },
        "lastMessage": {
          "uuid": "550e8400-e29b-41d4-a716-446655440000",
          "text": "Hello, how are you?",
          "createdAt": "2025-11-01T09:00:00.000Z"
        },
        "unreadCount": 3
      }
    ]
  },
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

### 3. Get Message by ID

**Endpoint:** `GET /api/messages/[id]`

**Description:** Retrieve a specific message by its UUID

**URL Parameters:**
- `id` - Message UUID

**Example Request:**
```http
GET /api/messages/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "senderUuid": "123e4567-e89b-12d3-a456-426614174000",
    "recipientUuid": "789e0123-e89b-12d3-a456-426614174111",
    "text": "Hello, how are you?",
    "read": "2025-11-01T10:30:00.000Z",
    "createdAt": "2025-11-01T09:00:00.000Z",
    "updatedAt": "2025-11-01T10:30:00.000Z",
    "sender": {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "numeFullName": "John Doe"
    },
    "recipient": {
      "uuid": "789e0123-e89b-12d3-a456-426614174111",
      "numeFullName": "Jane Smith"
    }
  },
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

### 4. Create Message

**Endpoint:** `POST /api/messages`

**Description:** Send a new message

**Query Parameters:**
- `sender` (required) - UUID of the message sender

**Request Body:**
```json
{
  "action": "create",
  "fields": {
    "recipientUuid": "789e0123-e89b-12d3-a456-426614174111",
    "text": "Hello, how are you?"
  }
}
```

**Validation Rules:**
- `recipientUuid` must be a valid UUID
- `text` must be between 1 and 10,000 characters
- Sender must exist in the database
- Recipient must exist in the database

**Example Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "senderUuid": "123e4567-e89b-12d3-a456-426614174000",
    "recipientUuid": "789e0123-e89b-12d3-a456-426614174111",
    "text": "Hello, how are you?",
    "read": null,
    "createdAt": "2025-11-01T09:00:00.000Z",
    "sender": { ... },
    "recipient": { ... }
  },
  "timestamp": "2025-11-01T09:00:00.000Z"
}
```

### 5. Mark Message as Read

**Endpoint:** `PUT /api/messages/[id]`

**Description:** Mark a message as read by setting the read timestamp

**URL Parameters:**
- `id` - Message UUID

**Example Request:**
```http
PUT /api/messages/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**
```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "senderUuid": "123e4567-e89b-12d3-a456-426614174000",
    "recipientUuid": "789e0123-e89b-12d3-a456-426614174111",
    "text": "Hello, how are you?",
    "read": "2025-11-01T10:30:00.000Z",
    "createdAt": "2025-11-01T09:00:00.000Z",
    "updatedAt": "2025-11-01T10:30:00.000Z",
    "sender": { ... },
    "recipient": { ... }
  },
  "timestamp": "2025-11-01T10:30:00.000Z"
}
```

**Notes:**
- If the message is already marked as read, it will not update the timestamp again
- Only unread messages (read: null) will have their timestamp updated

### 6. Delete Message

**Endpoint:** `DELETE /api/messages/[id]`

**Description:** Delete a message

**URL Parameters:**
- `id` - Message UUID

**Example Request:**
```http
DELETE /api/messages/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

### Common Error Codes

- `400` - Bad Request (validation error, missing parameters)
- `404` - Not Found (message, user not found)
- `500` - Internal Server Error

### Example Error Responses

**Missing Required Parameter:**
```json
{
  "success": false,
  "message": "User UUID is required",
  "data": null,
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed: recipientUuid must be a valid UUID",
  "data": null,
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

**Not Found:**
```json
{
  "success": false,
  "message": "Message not found",
  "data": null,
  "timestamp": "2025-11-01T11:00:00.000Z"
}
```

## Usage Examples

### Fetching Unread Messages

```javascript
const response = await fetch(
  '/api/messages?user=123e4567-e89b-12d3-a456-426614174000&unreadOnly=true'
);
const data = await response.json();
console.log(`You have ${data.data.pagination.total} unread messages`);
```

### Fetching Conversation with Specific User

```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const partnerId = '789e0123-e89b-12d3-a456-426614174111';

const response = await fetch(
  `/api/messages?user=${userId}&with=${partnerId}&limit=50`
);
const data = await response.json();
console.log('Conversation messages:', data.data.messages);
```

### Sending a Message

```javascript
const senderUuid = '123e4567-e89b-12d3-a456-426614174000';

const response = await fetch(`/api/messages?sender=${senderUuid}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'create',
    fields: {
      recipientUuid: '789e0123-e89b-12d3-a456-426614174111',
      text: 'Hello, how are you?'
    }
  })
});
const data = await response.json();
console.log('Message sent:', data.data);
```

### Marking Message as Read

```javascript
const messageId = '550e8400-e29b-41d4-a716-446655440000';

const response = await fetch(`/api/messages/${messageId}`, {
  method: 'PUT'
});
const data = await response.json();
console.log('Message marked as read:', data.data.read);
```

### Getting Conversations List

```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';

const response = await fetch(
  `/api/messages/conversations?user=${userId}`
);
const data = await response.json();
console.log('Conversations:', data.data.conversations);
```

## Database Schema

```sql
CREATE TABLE messages (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senderUuid UUID NOT NULL REFERENCES users(uuid),
  recipientUuid UUID NOT NULL REFERENCES users(uuid),
  text TEXT NOT NULL,
  read TIMESTAMP NULL DEFAULT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(senderUuid);
CREATE INDEX idx_messages_recipient ON messages(recipientUuid);
CREATE INDEX idx_messages_created ON messages(createdAt);
```

## File Structure

```
app/
  models/
    message-model.ts          # Message model definition
  controllers/
    messages-controller.ts    # Message business logic
  schemas/
    message-schemas.ts        # Zod validation schemas
  api/
    messages/
      route.ts               # GET all messages, POST new message
      conversations/
        route.ts             # GET conversations list
      [id]/
        route.ts             # GET, PUT, DELETE specific message
```

## Notes

- All timestamps are in ISO 8601 format
- The `read` field is `null` for unread messages and contains a timestamp for read messages
- Messages are ordered by creation date (newest first) by default
- Pagination defaults to 50 messages per page
- Both sender and recipient information is included in message responses
- The conversations endpoint is optimized for displaying a chat list with unread counts
