export const socialProviders = {
  google: {
    id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
    name: 'Google',
    icon: 'google',
    color: 'bg-white hover:bg-gray-50 text-gray-900'
  },
  facebook: {
    id: import.meta.env.VITE_FACEBOOK_APP_ID as string,
    name: 'Facebook',
    icon: 'facebook',
    color: 'bg-[#1877F2] hover:bg-[#0C63D4] text-white'
  },
  apple: {
    id: import.meta.env.VITE_APPLE_CLIENT_ID as string,
    name: 'Apple',
    icon: 'apple',
    color: 'bg-black hover:bg-gray-900 text-white'
  }
} as const 