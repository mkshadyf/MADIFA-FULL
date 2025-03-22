import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export interface NavItem {
  name: string
  path: string
}

interface NavItemProps {
  item: NavItem
  className?: string
  active?: boolean
  onClick?: () => void
}

export function NavItem({
  item,
  className,
  active,
  onClick,
}: NavItemProps) {
  return (
    <Link
      to={item.path}
      className={cn(
        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10',
        className
      )}
      onClick={onClick}
    >
      {item.name}
    </Link>
  )
}