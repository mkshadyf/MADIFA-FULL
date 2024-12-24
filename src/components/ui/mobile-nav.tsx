import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  name: string
  path: string
  icon: string
}

interface MobileNavProps {
  items: NavItem[]
  currentPath: string
}

export function MobileNav({ items, currentPath }: MobileNavProps) {
  const filteredItems = items.filter(Boolean) as NavItem[]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background">
      {filteredItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            'flex flex-col items-center justify-center px-4',
            currentPath === item.path
              ? 'text-primary'
              : 'text-muted-foreground hover:text-primary'
          )}
        >
          <i className={cn('text-xl', item.icon)} />
          <span className="mt-1 text-xs">{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}
