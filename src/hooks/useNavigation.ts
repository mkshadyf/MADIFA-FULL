import { useCallback } from 'react'
import type { NavigateFunction } from 'react-router-dom'

let navigationFunction: NavigateFunction | null = null

export function setNavigate(navigate: NavigateFunction) {
  navigationFunction = navigate
}

export function useNavigation() {
  const navigate = useCallback((to: string) => {
    if (navigationFunction) {
      navigationFunction(to)
    }
  }, [])

  return navigate
}
