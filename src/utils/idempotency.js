export const generateIdempotencyKey = () => {
  return crypto.randomUUID()
}

export const withIdempotency = (config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'Idempotency-Key': generateIdempotencyKey(),
    },
  }
}
