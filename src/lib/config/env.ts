export const env = {
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  NODE_ENV: import.meta.env.MODE,
} as const
