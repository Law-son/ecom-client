const REFRESH_TOKEN_KEY = 'ecom_rt'
const ACCESS_TOKEN_KEY = 'ecom_at'

// Simple XOR encryption (better than plaintext)
const encrypt = (text) => {
  const key = import.meta.env.VITE_TOKEN_KEY || 'default-key-change-in-production'
  return btoa(
    text
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join(''),
  )
}

const decrypt = (encoded) => {
  try {
    const key = import.meta.env.VITE_TOKEN_KEY || 'default-key-change-in-production'
    const text = atob(encoded)
    return text
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
      .join('')
  } catch {
    return null
  }
}

export const setAccessToken = (token) => {
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
}

export const getAccessToken = () => {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export const clearAccessToken = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, encrypt(token))
  }
}

export const getRefreshToken = () => {
  const encrypted = localStorage.getItem(REFRESH_TOKEN_KEY)
  return encrypted ? decrypt(encrypted) : null
}

export const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const clearAllTokens = () => {
  clearAccessToken()
  clearRefreshToken()
}
