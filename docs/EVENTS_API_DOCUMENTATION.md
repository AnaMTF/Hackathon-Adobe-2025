# Event API Documentation

## Overview
This document describes the Event API endpoints created for managing calendar events.

## Model: Event

### Attributes
- `uuid` (string, UUID): Unique identifier for the event (auto-generated)
- `name` (string, 1-255 chars): Event name
- `details` (string, optional): Event description/details
- `date` (Date, DATEONLY): Event date (YYYY-MM-DD format)
- `creatorUuid` (string, UUID): Reference to the User who created the event
- `createdAt` (Date): Timestamp of when the event was created
- `updatedAt` (Date): Timestamp of when the event was last updated

### Associations
- **belongsTo User** (as 'creator'): Each event has one creator

## API Endpoints

### GET /api/events
Get all events with optional filtering and pagination.

**Query Parameters:**
- `page` (number, optional, default: 1): Page number for pagination
- `limit` (number, optional, default: 50): Number of events per page
- `creator` (string, optional): Filter by creator UUID
- `date` (string, optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (string, optional): Filter events from this date onwards (YYYY-MM-DD)
- `endDate` (string, optional): Filter events up to this date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "uuid": "event-uuid",
        "name": "Team Meeting",
        "details": "Weekly sync meeting",
        "date": "2025-11-05",
        "creatorUuid": "user-uuid",
        "creator": {
          "uuid": "user-uuid",
          "numeFullName": "John Doe",
          "email": "john@example.com",
          ...
        },
        "createdAt": "2025-11-01T10:00:00.000Z",
        "updatedAt": "2025-11-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "pages": 1
    }
  },
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

### POST /api/events
Create a new event.

**Request Body:**
```json
{
  "action": "create",
  "fields": {
    "name": "Team Meeting",
    "details": "Weekly sync meeting",
    "date": "2025-11-05",
    "creatorUuid": "user-uuid"
  }
}
```

**Validation:**
- `name`: Required, 1-255 characters
- `details`: Optional, any string
- `date`: Required, YYYY-MM-DD format
- `creatorUuid`: Required, valid UUID

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "uuid": "event-uuid",
    "name": "Team Meeting",
    "details": "Weekly sync meeting",
    "date": "2025-11-05",
    "creatorUuid": "user-uuid",
    "creator": { ... },
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  },
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

### GET /api/events/:id
Get a specific event by UUID.

**Path Parameters:**
- `id` (string): Event UUID

**Response:**
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "uuid": "event-uuid",
    "name": "Team Meeting",
    "details": "Weekly sync meeting",
    "date": "2025-11-05",
    "creatorUuid": "user-uuid",
    "creator": { ... },
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  },
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

### PATCH /api/events/:id
Update an existing event.

**Path Parameters:**
- `id` (string): Event UUID

**Request Body:**
```json
{
  "action": "update",
  "fields": {
    "name": "Updated Meeting Name",
    "details": "Updated details",
    "date": "2025-11-06"
  }
}
```

**Validation:**
- At least one field must be provided
- `name`: Optional, 1-255 characters if provided
- `details`: Optional, any string
- `date`: Optional, YYYY-MM-DD format if provided

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "uuid": "event-uuid",
    "name": "Updated Meeting Name",
    "details": "Updated details",
    "date": "2025-11-06",
    "creatorUuid": "user-uuid",
    "creator": { ... },
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T12:00:00.000Z"
  },
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

### DELETE /api/events/:id
Delete an event.

**Path Parameters:**
- `id` (string): Event UUID

**Request Body:**
```json
{
  "action": "delete"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": {
    "uuid": "event-uuid"
  },
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "data": null,
  "timestamp": "2025-11-01T10:00:00.000Z"
}
```

**Common Error Codes:**
- `400`: Bad Request (validation errors, invalid action)
- `404`: Not Found (event or creator user not found)
- `500`: Internal Server Error

## Database Schema

The Events table includes the following indexes for performance:
- Index on `creatorUuid` for filtering by creator
- Index on `date` for date-based queries

Cascade delete is enabled, so deleting a user will also delete all their created events.

## Files Created

1. **Model**: `/app/models/event-model.ts`
2. **Schema**: `/app/schemas/event-schemas.ts`
3. **Controller**: `/app/controllers/events-controller.ts`
4. **Routes**:
   - `/app/api/events/route.ts` (GET, POST)
   - `/app/api/events/[id]/route.ts` (GET, PATCH, DELETE)

## Integration Notes

The Event model has been added to `/app/models/index.ts` and is exported for use throughout the application.

## Next Steps (Frontend Integration - Pending Approval)

Once approved, the following frontend changes can be made:
1. Replace local state in calendar with API calls
2. Fetch events from `/api/events` with date filtering
3. Create events via POST to `/api/events`
4. Update/delete events using the individual event endpoints
5. Add authentication to ensure users can only modify their own events
