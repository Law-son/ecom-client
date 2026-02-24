# Secure Token Storage Implementation

## Overview
Updated the authentication system to follow security best practices for token storage:

- **Access Token**: Stored in sessionStorage (cleared on tab close, survives refresh)
- **Refresh Token**: Stored in HttpOnly Secure cookie (server-side)

## Changes Made

### 1. Token Storage Utility (`src/utils/tokenStorage.js`)
- Centralized access token management
- Access token in sessionStorage (cleared when tab closes)
- Refresh token handled by server via HttpOnly cookie

### 2. API Client (`src/api/client.js`)
- Added `withCredentials: true` for cookie support
- Uses tokenStorage utility for access token
- Automatic token refresh on 401 errors
- Refresh token sent automatically via cookie

### 3. Auth API (`src/api/auth.js`)
- Login returns only access token in response body
- Refresh endpoint doesn't require body (uses cookie)
- Logout clears HttpOnly cookie on server

### 4. Session Store (`src/store/sessionStore.js`)
- Only persists user and role in localStorage
- Tokens managed separately via tokenStorage utility

### 5. Login Page (`src/pages/LoginPage.jsx`)
- Stores only access token in sessionStorage
- Refresh token automatically set as HttpOnly cookie by server

### 6. OAuth2 Redirect Page (`src/pages/OAuth2RedirectPage.jsx`)
- Stores only access token from URL parameter
- Refresh token automatically set as HttpOnly cookie by server

### 7. Layout Component (`src/components/Layout.jsx`)
- Clears access token on logout
- Server clears refresh token cookie

## Security Benefits

- **Access Token in sessionStorage**: Cleared when browser tab closes, survives refresh
- **Refresh Token in HttpOnly Cookie**: Not accessible to JavaScript (XSS protection)
- **CSRF Protection**: SameSite cookie attribute prevents CSRF attacks
- **Automatic Cookie Handling**: Browser sends cookie automatically with requests
- **No Token in localStorage**: Reduces XSS attack surface

## Server Implementation

The backend implements:

1. **Login endpoint** (`POST /api/v1/auth/login`):
   - Returns access token in response body
   - Sets refresh token as HttpOnly cookie

2. **Refresh endpoint** (`POST /api/v1/auth/refresh`):
   - Reads refresh token from HttpOnly cookie
   - Returns new access token in response body
   - Sets new refresh token as HttpOnly cookie
   - Revokes old refresh token

3. **Logout endpoint** (`POST /api/v1/auth/logout`):
   - Revokes all refresh tokens for user
   - Clears refresh token cookie

4. **OAuth2 redirect**:
   - Returns access token in URL parameter
   - Sets refresh token as HttpOnly cookie

5. **Cookie configuration**:
   - HttpOnly: true (not accessible via JavaScript)
   - Secure: true in production (HTTPS only)
   - SameSite: Lax (CSRF protection)
   - Max-Age: 7 days

## Token Lifetimes

- **Access Token**: 60 minutes (short-lived)
- **Refresh Token**: 7 days (long-lived, in HttpOnly cookie)
