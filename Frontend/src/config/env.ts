export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  isProd: process.env.NODE_ENV === 'production',
} as const; 