# API Usage Examples

This document demonstrates how to use the new action-based API with JSON schema validation.

## User API Examples

### Create a User
```bash
POST /api/users
Content-Type: application/json

{
  "action": "create",
  "fields": {
    "numeFullName": "John Doe",
    "email": "john.doe@company.com",
    "parola": "securePassword123",
    "departament": "Engineering",
    "jobTitle": "Senior Developer",
    "location": "Bucharest, Romania",
    "telefon": "+40123456789",
    "poza": "https://example.com/profile.jpg"
  }
}
```

### Update a User (PUT /api/users/[id])
```bash
PUT /api/users/{user-uuid}
Content-Type: application/json

{
  "action": "update",
  "fields": {
    "jobTitle": "Lead Developer",
    "location": "Remote"
  }
}
```

## Post API Examples

### Create a Post
```bash
POST /api/posts
Content-Type: application/json

{
  "action": "create",
  "content": {
    "authorUuid": "user-uuid-here",
    "text": "Excited to share our new project!",
    "poze": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "tags": ["user-uuid-1", "user-uuid-2"],
    "event": {
      "location": "Conference Room A",
      "time": "2025-11-15T10:00:00Z"
    }
  }
}
```

### Like a Post
```bash
POST /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "like",
  "content": {
    "userUuid": "user-uuid-here"
  }
}
```

### Unlike a Post
```bash
POST /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "unlike",
  "content": {
    "userUuid": "user-uuid-here"
  }
}
```

### Comment on a Post
```bash
POST /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "comment",
  "content": {
    "userUuid": "user-uuid-here",
    "text": "Great work! Looking forward to seeing more updates."
  }
}
```

### Favorite a Post
```bash
POST /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "favorite",
  "content": {
    "userUuid": "user-uuid-here"
  }
}
```

### Unfavorite a Post
```bash
POST /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "unfavorite",
  "content": {
    "userUuid": "user-uuid-here"
  }
}
```

### Update a Post (PUT /api/posts/[id])
```bash
PUT /api/posts/{post-uuid}
Content-Type: application/json

{
  "action": "update",
  "content": {
    "text": "Updated post content with more details!",
    "tags": ["user-uuid-1", "user-uuid-2", "user-uuid-3"]
  }
}
```

## Response Format

All endpoints return a standardized response format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Actual response data
  },
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "timestamp": "2025-11-01T12:00:00.000Z"
}
```

## Validation

The API uses Zod for JSON schema validation. Common validation errors include:

- Missing required fields
- Invalid email format
- Invalid UUID format
- String length violations
- Invalid URL format for images
- Maximum limits exceeded (e.g., 3 photos, 10 tags, 256 char text)

## Features

### User Management
- ✅ Create users with full validation
- ✅ Update user profiles
- ✅ Search users by name, email, department, location
- ✅ Password security (excluded from responses)

### Post Management
- ✅ Create posts with photos, tags, and events
- ✅ Like/unlike posts
- ✅ Comment on posts
- ✅ Favorite/unfavorite posts
- ✅ Update and delete posts
- ✅ Search and filter posts
- ✅ Department-based feeds

### Data Integrity
- ✅ Foreign key constraints
- ✅ Unique constraints (email, likes, favorites)
- ✅ Input validation and sanitization
- ✅ Type safety with TypeScript