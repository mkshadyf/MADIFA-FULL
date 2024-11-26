

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => null,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const root = window.document.documentElement
    const savedTheme = localStorage.getItem('theme') as Theme | null

    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.setAttribute('data-theme', systemTheme)
      } else {
        root.setAttribute('data-theme', savedTheme)
      }
    }
  }, [])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      const root = window.document.documentElement
      localStorage.setItem('theme', newTheme)
      setTheme(newTheme)
      
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.setAttribute('data-theme', systemTheme)
      } else {
        root.setAttribute('data-theme', newTheme)
      }
    },
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 
