export const APP_NAME = 'Madifa'

export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SEARCH: '/search',
  WATCH: '/watch',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    CONTENT: '/admin/content',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
    VIMEO: '/admin/vimeo'
  },
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    RESET_PASSWORD: '/auth/reset-password'
  }
} as const

export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'movies', name: 'Movies' },
  { id: 'series', name: 'Series' },
  { id: 'music', name: 'Music' }
] as const

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PREMIUM_PLUS: 'premium_plus'
} as const

export const API_ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong. Please try again.',
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_IN_USE: 'Email already in use',
    WEAK_PASSWORD: 'Password is too weak'
  }
} as const 