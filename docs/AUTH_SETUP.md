# Authentication Quick Start Guide

## What's Been Set Up

Your application now has a complete authentication system! Here's what was added:

### 🔐 Core Authentication Features

1. **User Registration** (`/register`)
   - Users can create accounts with their XIAT email
   - Passwords are securely hashed with bcrypt
   - Automatic login after successful registration

2. **User Login** (`/auth`)
   - Email and password authentication
   - 30-day session duration
   - Secure JWT token stored in HTTP-only cookie

3. **User Logout**
   - Available from the header dropdown menu
   - Clears session and redirects to login

4. **Protected Routes**
   - `/feed`, `/messages`, `/calendar`, `/user` require authentication
   - Automatic redirect to login if not authenticated

5. **Public Routes**
   - `/auth` and `/register` redirect to feed if already logged in

### 📁 New Files Created

```
/lib/auth.ts                        # Authentication utilities
/app/api/auth/signup/route.ts       # Signup endpoint
/app/api/auth/login/route.ts        # Login endpoint
/app/api/auth/logout/route.ts       # Logout endpoint
/app/api/auth/me/route.ts           # Get current user endpoint
/app/contexts/AuthContext.tsx       # Client-side auth state
/middleware.ts                      # Route protection
/AUTH_DOCUMENTATION.md              # Detailed docs
/.env.local.example                 # Environment variables template
```

### 📦 New Dependencies

- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `@types/jsonwebtoken` - TypeScript types

### 🎯 Testing the Authentication

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Create an account**:
   - Navigate to http://localhost:3000/register
   - Fill in the form with:
     - Full name
     - Email ending with @xiat.com
     - Password (min 6 characters)
     - Department
     - Job title
   - Click "Create account"

3. **Verify automatic login**:
   - You should be redirected to `/feed`
   - Header should show your name and a dropdown menu

4. **Test logout**:
   - Click on your name in the header
   - Select "Logout"
   - You should be redirected to `/auth`

5. **Test login**:
   - Enter your email and password
   - Click "Log in"
   - You should be redirected to `/feed`

6. **Test route protection**:
   - While logged out, try to access `/feed` directly
   - You should be redirected to `/auth`
   - After logging in, you should be able to access `/feed`

### ⚙️ Configuration

1. **Create `.env.local`** (optional but recommended):
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update the JWT secret**:
   ```env
   JWT_SECRET=your-super-secret-key-here
   ```
   Generate a secure secret with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 🔧 Using Auth in Your Components

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.numeFullName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 🛡️ Security Features

- ✅ Passwords hashed with bcrypt (salt factor: 10)
- ✅ HTTP-only cookies (prevents XSS)
- ✅ Secure cookies in production
- ✅ SameSite=Lax (prevents CSRF)
- ✅ JWT tokens expire after 30 days
- ✅ Middleware protects sensitive routes
- ✅ Passwords never sent in responses

### 📚 More Information

See `AUTH_DOCUMENTATION.md` for:
- Complete API documentation
- Security best practices
- Advanced usage examples
- Troubleshooting guide

### 🚀 Next Steps

Your authentication is ready to use! Users can:
1. Register new accounts
2. Log in with email/password
3. Stay logged in for 30 days
4. Access protected routes
5. Log out when needed

The system is production-ready - just make sure to:
- Set a strong `JWT_SECRET` in production
- Use HTTPS in production
- Consider adding password reset functionality
- Consider adding email verification
