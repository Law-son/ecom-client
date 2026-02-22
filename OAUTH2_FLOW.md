# OAuth2 Login Flow - Quick Reference

## Flow Diagram

```
┌─────────────┐
│   User      │
│ clicks      │
│ "Google"    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend redirects to:                                  │
│ http://localhost:8080/oauth2/authorization/google       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Backend redirects to Google consent screen              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ User authorizes app on Google                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Google redirects to:                                    │
│ http://localhost:8080/login/oauth2/code/google          │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Backend:                                                │
│ 1. Fetches user profile from Google                    │
│ 2. Creates/updates user in database                    │
│ 3. Assigns role based on email allowlists              │
│ 4. Generates JWT access + refresh tokens               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Backend redirects to:                                   │
│ http://localhost:5173/oauth2/redirect                   │
│   ?accessToken=xxx                                      │
│   &refreshToken=yyy                                     │
│   &tokenType=Bearer                                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend (OAuth2RedirectPage):                          │
│ 1. Extracts tokens from query params                   │
│ 2. Decodes JWT to get user info                        │
│ 3. Stores session in localStorage                      │
│ 4. Syncs cart to server                                │
│ 5. Redirects to /catalog or /admin                     │
└─────────────────────────────────────────────────────────┘
```

## Token Refresh Flow

```
┌─────────────┐
│   User      │
│ makes API   │
│ request     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ API Client adds Authorization header:                   │
│ Authorization: Bearer <accessToken>                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│ Backend validates token                                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ├─── Token valid ───────────────────────────────────┐
       │                                                    │
       │                                                    ▼
       │                                          ┌─────────────────┐
       │                                          │ Return response │
       │                                          └─────────────────┘
       │
       └─── Token expired/invalid (401) ──────────────────┐
                                                           │
                                                           ▼
                                              ┌────────────────────────┐
                                              │ API Client intercepts  │
                                              │ 401 response           │
                                              └────────┬───────────────┘
                                                       │
                                                       ▼
                                              ┌────────────────────────┐
                                              │ Has refresh token?     │
                                              └────────┬───────────────┘
                                                       │
                                    ┌──────────────────┴──────────────────┐
                                    │                                     │
                                    ▼                                     ▼
                          ┌─────────────────┐                  ┌─────────────────┐
                          │ YES: Call       │                  │ NO: Clear       │
                          │ /auth/refresh   │                  │ session and     │
                          └────────┬────────┘                  │ redirect to     │
                                   │                           │ /login          │
                                   ▼                           └─────────────────┘
                          ┌─────────────────┐
                          │ Refresh success?│
                          └────────┬────────┘
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                        ▼                     ▼
              ┌─────────────────┐   ┌─────────────────┐
              │ YES: Update     │   │ NO: Clear       │
              │ tokens in       │   │ session and     │
              │ localStorage    │   │ redirect to     │
              └────────┬────────┘   │ /login          │
                       │            └─────────────────┘
                       ▼
              ┌─────────────────┐
              │ Retry original  │
              │ request with    │
              │ new token       │
              └─────────────────┘
```

## Code Examples

### 1. Email/Password Login

```javascript
import { loginUser } from '../api/auth'
import useSessionStore from '../store/sessionStore'
import { decodeJwtPayload } from '../utils/jwt'

const login = useSessionStore((state) => state.login)

// Login
const data = await loginUser({ email, password })
// data = { accessToken, refreshToken, tokenType }

// Decode JWT
const payload = decodeJwtPayload(data.accessToken)
// payload = { sub, userId, role, fullName, exp, iat }

// Store session
login(user, role, {
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  tokenType: 'Bearer',
  expiresAt: payload.exp * 1000
})
```

### 2. Google OAuth2 Login

```javascript
// Redirect to Google
const handleGoogleLogin = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  window.location.href = `${apiBaseUrl}/oauth2/authorization/google`
}

// Handle callback (OAuth2RedirectPage.jsx)
const [searchParams] = useSearchParams()
const accessToken = searchParams.get('accessToken')
const refreshToken = searchParams.get('refreshToken')

// Decode and store session (same as email/password)
```

### 3. Automatic Token Refresh

```javascript
// Happens automatically in apiClient.js
// No manual code needed!

// The interceptor:
// 1. Detects 401 response
// 2. Calls refreshAccessToken(refreshToken)
// 3. Updates tokens in localStorage
// 4. Retries original request
```

### 4. Logout

```javascript
import { logoutUser } from '../api/auth'
import useSessionStore from '../store/sessionStore'

const logout = useSessionStore((state) => state.logout)

// Call server logout (revokes refresh tokens)
await logoutUser()

// Clear local session
logout()
```

## Role Mapping

| Backend Role | Frontend Role | UI Access                          |
|--------------|---------------|------------------------------------|
| CUSTOMER     | customer      | Catalog, Cart, Orders, Checkout    |
| STAFF        | admin         | All admin routes + customer routes |
| ADMIN        | admin         | All admin routes + customer routes |

## Token Lifetimes

| Token Type     | Lifetime   | Storage       | Purpose                    |
|----------------|------------|---------------|----------------------------|
| Access Token   | 60 minutes | localStorage  | API authentication         |
| Refresh Token  | 7 days     | localStorage  | Refresh expired access token |

## Security Notes

1. **Tokens are stored in localStorage** - accessible to JavaScript (XSS risk)
2. **HTTPS required in production** - prevents token interception
3. **Refresh token rotation** - old refresh token is revoked on each refresh
4. **Server-side logout** - revokes all refresh tokens for the user
5. **Token validation** - backend validates signature and expiry on each request

## Common Issues

### Issue: "Invalid token signature"
**Cause**: Token was tampered with or backend secret changed  
**Solution**: Re-login to get new token

### Issue: "Token expired"
**Cause**: Access token expired (60 minutes)  
**Solution**: Automatic refresh (no action needed)

### Issue: OAuth2 redirect fails
**Cause**: Redirect URI mismatch  
**Solution**: Check `OAUTH2_REDIRECT_URI` in backend matches `http://localhost:5173/oauth2/redirect`

### Issue: 403 Forbidden on admin routes
**Cause**: User role is CUSTOMER  
**Solution**: Use admin account or add email to `OAUTH2_ADMIN_EMAILS`

### Issue: Refresh token expired
**Cause**: User hasn't logged in for 7 days  
**Solution**: Re-login (automatic redirect to /login)
