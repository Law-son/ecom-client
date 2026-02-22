# Spring Security Integration - Client Updates

## Overview
The client has been updated to handle the Spring Boot API's new Spring Security features including JWT authentication, refresh tokens, OAuth2 (Google) login, role-based access control, and automatic session management.

## Changes Made

### 1. Session Store (`src/store/sessionStore.js`)
- **Added `refreshToken`** storage for token refresh functionality
- **Added `updateTokens()`** method to update tokens without full re-login
- **Added `isTokenExpired()`** method to check if access token has expired

### 2. Auth API (`src/api/auth.js`)
- **Updated `loginUser()`** to handle new response format: `{ accessToken, refreshToken, tokenType }`
- **Added `refreshAccessToken()`** to refresh expired access tokens using refresh token
- **Added `logoutUser()`** to call server-side logout endpoint (revokes refresh tokens)

### 3. API Client (`src/api/client.js`)
- **Added 401 interceptor** that automatically:
  - Detects expired/invalid tokens (401 responses)
  - Attempts to refresh the access token using the refresh token
  - Retries the original request with the new token
  - Redirects to login page if refresh fails or no refresh token exists
- **Added token refresh queue** to prevent multiple simultaneous refresh requests
- **Added automatic token storage update** after successful refresh

### 4. Protected Route (`src/components/ProtectedRoute.jsx`)
- **Added token expiry check** - redirects to login if token is expired
- **Added STAFF role support** - maps STAFF role to admin for UI purposes
- **Improved role normalization** - handles case-insensitive role matching

### 5. Login Page (`src/pages/LoginPage.jsx`)
- **Updated to handle new auth response** with `accessToken` and `refreshToken`
- **Added Google OAuth2 login button** - redirects to `/oauth2/authorization/google`
- **Added STAFF role support** - treats STAFF as admin
- **Added error parameter handling** - displays OAuth2 errors from query params
- **Improved token decoding** - extracts user info from JWT payload

### 6. OAuth2 Redirect Page (`src/pages/OAuth2RedirectPage.jsx`) - NEW
- **Handles OAuth2 callback** from Google login
- **Extracts tokens from query parameters** (`accessToken`, `refreshToken`)
- **Decodes JWT and extracts user info** (userId, email, fullName, role)
- **Stores session and syncs cart** to server
- **Redirects to appropriate page** based on role (admin or customer)
- **Handles errors** - redirects to login with error message

### 7. Signup Page (`src/pages/SignupPage.jsx`)
- **Updated to handle new auth response** with `accessToken` and `refreshToken`
- **Added STAFF role support** - treats STAFF as admin
- **Simplified login flow** after signup

### 8. Layout Component (`src/components/Layout.jsx`)
- **Updated logout handler** to call server-side logout API
- **Added STAFF role support** - shows admin links for STAFF users
- **Improved error handling** - logs logout errors but still clears session

### 9. App Routes (`src/App.jsx`)
- **Added OAuth2 redirect route** - `/oauth2/redirect` for OAuth2 callback handling

## Features Implemented

### ✅ JWT Authentication
- Access tokens (short-lived, 60 minutes)
- Refresh tokens (long-lived, 7 days)
- Automatic token refresh on 401 errors
- Token expiry checking

### ✅ OAuth2 (Google) Login
- Google sign-in button on login page
- OAuth2 callback handler at `/oauth2/redirect`
- Automatic account linking by email
- Role assignment based on server configuration

### ✅ Role-Based Access Control (RBAC)
- Support for CUSTOMER, STAFF, and ADMIN roles
- STAFF role mapped to admin UI access
- Protected routes with role checking
- Automatic redirect on unauthorized access

### ✅ Session Management
- Automatic logout on token expiry
- Redirect to login when logged out
- Server-side logout (revokes refresh tokens)
- Persistent session storage (localStorage)

### ✅ Security Features
- Automatic token refresh before expiry
- Secure token storage
- Request queuing during token refresh
- Logout on authentication failure

## Testing Checklist

### Email/Password Login
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should show error)
- [ ] Access protected routes after login
- [ ] Token refresh after 60 minutes (automatic)
- [ ] Logout (should revoke tokens and redirect)

### OAuth2 (Google) Login
- [ ] Click "Continue with Google" button
- [ ] Complete Google authorization
- [ ] Redirect to `/oauth2/redirect` with tokens
- [ ] Automatic login and redirect to catalog/admin
- [ ] Error handling (cancel OAuth2 flow)

### Role-Based Access
- [ ] CUSTOMER can access cart, orders, checkout
- [ ] CUSTOMER cannot access admin routes
- [ ] ADMIN can access all admin routes
- [ ] STAFF can access admin routes (treated as admin)
- [ ] Unauthorized access redirects to catalog

### Token Refresh
- [ ] Access token expires after 60 minutes
- [ ] Automatic refresh on next API call
- [ ] Original request retries with new token
- [ ] Redirect to login if refresh fails

### Session Persistence
- [ ] Session persists after page refresh
- [ ] Session cleared after logout
- [ ] Session cleared after token refresh failure
- [ ] Cart syncs after login

## Environment Variables

Ensure the following environment variable is set in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Backend Configuration Required

The backend must be configured with:

1. **OAuth2 credentials** (Google Cloud Console):
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`

2. **OAuth2 redirect URI**:
   - `OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/redirect`

3. **Role allowlists** (optional):
   - `OAUTH2_ADMIN_EMAILS` - comma-separated admin emails
   - `OAUTH2_STAFF_EMAILS` - comma-separated staff emails

## API Endpoints Used

- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (revoke refresh tokens)
- `GET /oauth2/authorization/google` - Start OAuth2 flow
- `GET /login/oauth2/code/google` - OAuth2 callback (handled by backend)

## Notes

- **Token rotation**: Refresh tokens are rotated on each refresh (old token revoked, new token issued)
- **Account linking**: OAuth2 and email/password accounts are linked by email
- **Role updates**: OAuth2 login can update user roles based on server allowlists
- **STAFF role**: Treated as admin in the UI for simplicity
- **Token expiry**: Access tokens expire after 60 minutes, refresh tokens after 7 days
- **Automatic refresh**: Tokens are refreshed automatically on 401 errors
- **Logout behavior**: Clears local session and revokes all refresh tokens on server

## Troubleshooting

### "Invalid token" error
- Check that backend JWT secret is configured
- Verify token hasn't been tampered with
- Check token expiry time

### OAuth2 redirect fails
- Verify `OAUTH2_REDIRECT_URI` matches frontend URL
- Check Google Cloud Console redirect URI configuration
- Ensure backend OAuth2 credentials are set

### Token refresh fails
- Check that refresh token is stored in localStorage
- Verify refresh token hasn't expired (7 days)
- Check backend refresh endpoint is working

### 403 Forbidden on admin routes
- Verify user role is ADMIN or STAFF
- Check OAuth2 email allowlists if using OAuth2
- Ensure role is correctly decoded from JWT
