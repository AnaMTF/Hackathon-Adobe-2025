# Authentication System Documentation

## Overview
This application uses a JWT-based authentication system with bcrypt password hashing. Sessions are maintained for 30 days before expiring.

## Features
- ✅ User signup with email and password
- ✅ Secure password hashing using bcrypt
- ✅ JWT token-based authentication
- ✅ HTTP-only cookies for secure token storage
- ✅ 30-day session duration
- ✅ Protected routes with middleware
- ✅ Client-side auth context for state management

## API Endpoints

### POST /api/auth/signup
Creates a new user account and logs them in automatically.

**Request Body:**
```json
{
  "numeFullName": "John Doe",
  "email": "john.doe@xiat.com",
  "parola": "password123",
  "departament": "Engineering",
  "jobTitle": "Software Developer",
  "telefon": "+1234567890",  // optional
  "location": "New York",     // optional
  "poza": "https://..."       // optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "uuid": "...",
      "numeFullName": "John Doe",
      "email": "john.doe@xiat.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login
Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "john.doe@xiat.com",
  "parola": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

### POST /api/auth/logout
Logs out the current user by removing the auth cookie.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/me
Returns the currently authenticated user's information.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User authenticated",
  "data": {
    "user": { ... }
  }
}
```

## Protected Routes
The following routes require authentication:
- `/feed`
- `/messages`
- `/calendar`
- `/user`

If a user tries to access these routes without being logged in, they will be redirected to `/auth`.

## Public Routes
If an authenticated user tries to access these routes, they will be redirected to `/feed`:
- `/auth` (login page)
- `/register` (signup page)

## Security Features

### Password Hashing
- Passwords are hashed using bcrypt with a salt factor of 10
- Original passwords are never stored in the database

### JWT Tokens
- Tokens are signed with a secret key
- Token expiration is set to 30 days
- Tokens contain minimal information (userId and email)

### Cookies
- HTTP-only cookies prevent XSS attacks
- Secure flag is enabled in production
- SameSite=Lax prevents CSRF attacks

## Environment Variables

Add these to your `.env.local` file:

```env
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=production  # or development
```

## Usage in Components

### Using the Auth Context

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <button onClick={() => login('email', 'password')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user.numeFullName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Server-Side Auth Check

```tsx
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // User is authenticated
  return Response.json({ user });
}
```

## Password Requirements (Frontend Validation)
- Minimum 6 characters (enforced by backend)
- Frontend shows strength meter based on:
  - Length (8+ characters)
  - Uppercase letters
  - Numbers
  - Special characters

## Database Schema
The User model includes:
- `uuid` (primary key)
- `numeFullName` (required)
- `email` (required, unique)
- `parola` (required, hashed)
- `departament` (required)
- `jobTitle` (required)
- `poza` (optional URL)
- `telefon` (optional)
- `location` (optional)
- `createdAt`, `updatedAt` (timestamps)

## Testing the Authentication

1. **Register a new user**: Navigate to `/register` and fill out the form
2. **Verify redirect**: After registration, you should be automatically logged in and redirected to `/feed`
3. **Check persistence**: Refresh the page - you should remain logged in
4. **Try protected routes**: Access `/feed`, `/messages`, etc. - should work
5. **Logout**: Click the logout button in the header
6. **Try accessing protected routes**: Should redirect to `/auth`
7. **Login**: Use your email and password to log back in

## Notes
- Passwords are case-sensitive
- Email addresses must be unique
- The frontend validates that emails end with `@xiat.com`
- Session tokens expire after 30 days
- Tokens are automatically included in requests via cookies
