# Secure Token Storage Implementation

## Overview
Updated the authentication system to follow security best practices for token storage:

- **Access Token**: Stored in sessionStorage (cleared on tab close, survives refresh)
- **Refresh Token**: Stored in localStorage with XOR encryption

## Changes Made

### 1. Token Storage Utility (`src/utils/tokenStorage.js`)
- Created centralized token management with encryption
- Access token in sessionStorage (cleared when tab closes)
- Refresh token encrypted in localStorage
- XOR encryption for basic obfuscation (better than plaintext)

### 2. API Client (`src/api/client.js`)
- Uses tokenStorage utility for all token operations
- Automatic token refresh on 401 errors
- Clears all tokens on auth failure

### 3. Session Store (`src/store/sessionStore.js`)
- Only persists user and role in localStorage
- Tokens managed separately via tokenStorage utility

### 4. Login Page (`src/pages/LoginPage.jsx`)
- Stores both tokens using tokenStorage utility

### 5. OAuth2 Redirect Page (`src/pages/OAuth2RedirectPage.jsx`)
- Stores both tokens using tokenStorage utility

### 6. Layout Component (`src/components/Layout.jsx`)
- Clears all tokens on logout

## Security Benefits

- **Access Token in sessionStorage**: Cleared when browser tab closes
- **Refresh Token Encrypted**: Not stored in plaintext
- **Separation of Concerns**: Tokens not mixed with app state
- **XSS Mitigation**: Encryption adds a layer of protection
- **No Server Changes Required**: Works with existing backend

## Configuration

Add to `.env` for custom encryption key:
```
VITE_TOKEN_KEY=your-secret-key-here
```

## Trade-offs

- sessionStorage: Cleared on tab close (user must re-login)
- localStorage: Persists across sessions but accessible to XSS
- Encryption: Basic XOR (not cryptographically secure, but better than plaintext)
