/**
 * Decodes a JWT payload without verification (client-side only).
 * The backend validates the token; we only need claims for UI (role, user id, etc.).
 * @param {string} token - Raw JWT string
 * @returns {object|null} Decoded payload or null if invalid
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64url = parts[1]
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}
