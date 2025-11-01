# Real-Time Message Notifications Implementation

## Overview
This document describes the Server-Sent Events (SSE) implementation for real-time message notifications, mirroring the calendar events SSE system.

## Architecture

### Components Created

1. **lib/message-sse.ts** - SSE Manager Singleton
   - Manages client connections per user
   - Broadcasts message events to specific users
   - Tracks unread message counts

2. **app/api/messages/sse/route.ts** - SSE Endpoint
   - Authenticates users via JWT token
   - Creates persistent SSE connections
   - Sends heartbeats every 30 seconds

3. **Updated app/controllers/messages-controller.ts**
   - Broadcasts `messageCreated` events when new messages are sent
   - Broadcasts `messageRead` events when messages are marked as read
   - Sends `unreadCountUpdate` events with current count

4. **Updated app/components/header.tsx**
   - Connects to `/api/messages/sse` on user login
   - Listens for real-time unread count updates
   - Fetches initial unread count on mount
   - Updates localStorage and UI state

## Event Types

### 1. `connected`
Sent immediately when SSE connection is established.
```json
{
  "type": "connected",
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

### 2. `messageCreated`
Sent to the recipient when a new message is created.
```json
{
  "type": "messageCreated",
  "data": {
    "uuid": "message-uuid",
    "text": "Message content",
    "senderUuid": "sender-uuid",
    "recipientUuid": "recipient-uuid",
    "receiverUuid": "recipient-uuid",
    "sender": { /* user object */ },
    "recipient": { /* user object */ },
    "createdAt": "2025-11-01T12:00:00.000Z"
  }
}
```

### 3. `messageRead`
Sent to the sender when their message is marked as read.
```json
{
  "type": "messageRead",
  "data": {
    "uuid": "message-uuid",
    "senderUuid": "sender-uuid",
    "read": "2025-11-01T12:05:00.000Z"
  }
}
```

### 4. `unreadCountUpdate`
Sent to a user when their unread message count changes.
```json
{
  "type": "unreadCountUpdate",
  "data": {
    "unreadCount": 5
  }
}
```

## How It Works

### Connection Flow
1. User logs in and header component mounts
2. Header fetches initial unread count via REST API
3. Header establishes SSE connection to `/api/messages/sse`
4. Server authenticates user and creates persistent connection
5. Server sends heartbeat every 30 seconds to keep connection alive

### Message Creation Flow
1. User A sends a message to User B via `POST /api/messages`
2. Controller creates message in database
3. Controller broadcasts `messageCreated` event to User B's SSE connections
4. Controller counts User B's unread messages
5. Controller broadcasts `unreadCountUpdate` to User B's SSE connections
6. User B's header receives event and updates badge in real-time

### Message Read Flow
1. User B marks message as read via `PUT /api/messages/[id]`
2. Controller updates message in database
3. Controller broadcasts `messageRead` event to User A's SSE connections
4. Controller counts User B's remaining unread messages
5. Controller broadcasts `unreadCountUpdate` to User B's SSE connections
6. User B's header badge updates immediately

## Testing

### Test Scenario 1: New Message Notification
1. Open the app in two browser windows (or incognito + regular)
2. Log in as User A in window 1
3. Log in as User B in window 2
4. From window 1, send a message to User B
5. **Expected**: Window 2's header badge should update immediately showing new unread count

### Test Scenario 2: Read Receipt
1. Continue from scenario 1 with both users logged in
2. In window 2 (User B), navigate to messages and open the conversation
3. Mark the message as read
4. **Expected**: Window 2's header badge should decrease immediately

### Test Scenario 3: Multiple Tabs
1. Log in as same user in multiple tabs
2. Send messages to this user from another account
3. **Expected**: All tabs should show same unread count simultaneously

## Server Logs to Monitor

When debugging, watch for these log messages:

```
[MessageSSE] Client connected: client-xxx (user: uuid). Total clients: 1
[MessageSSE] Authenticated user: uuid
[createMessage] Broadcasting new message via SSE to recipient: uuid
[createMessage] Sending unread count update to recipient: 5
[MessageSSE] Sent messageCreated to 1 clients for user uuid
[MessageSSE] Sent unreadCountUpdate to 1 clients for user uuid
[markMessageAsRead] Broadcasting read notification via SSE to sender: uuid
[markMessageAsRead] Sending updated unread count to recipient: 4
```

## Browser Console Logs

In the header component, look for:

```
[Header] Setting up message SSE connection for user: uuid
[Header] Initial unread count: 5
[Header] Message SSE connected: 2025-11-01T12:00:00.000Z
[Header] SSE message received: { type: 'unreadCountUpdate', data: { unreadCount: 6 } }
[Header] Unread count update: 6
```

## Key Features

### User-Specific Notifications
- Each SSE connection is tied to a specific user ID
- Events are only sent to relevant users (recipient for new messages, sender for read receipts)
- Multiple tabs for same user all receive same events

### Connection Management
- Automatic cleanup on disconnect
- Heartbeat keeps connection alive through proxies/firewalls
- Graceful handling of connection errors

### Performance
- Efficient: Only sends events to connected users
- No polling required
- Minimal server resources (persistent connections)

### State Synchronization
- Updates both React state and localStorage
- Survives page refreshes
- Cross-tab communication via localStorage events (existing)
- Plus real-time SSE updates

## Comparison with Calendar SSE

| Feature | Calendar Events | Messages |
|---------|----------------|----------|
| **Broadcast Type** | All users | Specific users |
| **Event Types** | Created, Updated, Deleted | Created, Read, UnreadCount |
| **Authentication** | Not required | Required (JWT) |
| **User Tracking** | No | Yes (userId in client) |
| **Heartbeat** | 30s | 30s |

## Files Modified

- ✅ `lib/message-sse.ts` (created)
- ✅ `app/api/messages/sse/route.ts` (created)
- ✅ `app/controllers/messages-controller.ts` (updated)
- ✅ `app/components/header.tsx` (updated)

## Future Enhancements

Consider adding:
1. Sound/notification API for new messages
2. Desktop notifications (with permission)
3. Message preview in notification
4. Typing indicators
5. Online/offline status
6. Message delivery status

## Troubleshooting

### SSE Not Connecting
- Check browser console for authentication errors
- Verify JWT token is valid in cookies
- Check server logs for connection attempts

### Unread Count Not Updating
- Verify SSE connection is established (check console)
- Check server logs for broadcast messages
- Ensure user is recipient of the message
- Clear browser cache and hard refresh

### Multiple Tabs Not Syncing
- Both SSE and localStorage events should keep tabs in sync
- Check if SSE is connected in all tabs
- Verify localStorage is accessible (not disabled)
