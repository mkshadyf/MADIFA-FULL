# Component Refactoring Plan

## Current Issues
The components directory is overly complex with:
- Deeply nested folders
- Duplicated components across directories
- Inconsistent naming and organization
- Mixed responsibilities

## New Structure

```
src/
└── components/
    ├── index.ts                     # Main barrel export
    ├── admin/                       # Admin-specific components
    │   ├── index.ts                 # Barrel export
    │   ├── dashboard/               # Admin dashboard components
    │   │   ├── index.ts
    │   │   ├── StatsOverview.tsx
    │   │   └── ActivityLog.tsx
    │   ├── users/                   # User management components
    │   │   ├── index.ts
    │   │   ├── UsersList.tsx
    │   │   ├── UserSearch.tsx
    │   │   └── UserDetails.tsx
    │   └── content/                 # Content management components
    │       ├── index.ts
    │       ├── ContentList.tsx
    │       ├── ContentForm.tsx
    │       └── ContentSearch.tsx
    ├── analytics/                   # Analytics components
    │   ├── index.ts
    │   ├── charts/                  # Chart components
    │   │   ├── index.ts
    │   │   ├── UserActivityChart.tsx
    │   │   └── ContentAnalyticsChart.tsx
    │   ├── RealTimeStats.tsx
    │   ├── WorldMap.tsx
    │   └── AnalyticsDashboard.tsx
    ├── auth/                        # Authentication components
    │   ├── index.ts
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx
    │   ├── ResetPasswordForm.tsx
    │   └── SocialAuth.tsx
    ├── content/                     # Content display components
    │   ├── index.ts
    │   ├── browser/                 # Content browsing
    │   │   ├── index.ts
    │   │   ├── CategoryBrowser.tsx
    │   │   └── Navigation.tsx
    │   ├── grid/                    # Grid layouts
    │   │   ├── index.ts
    │   │   └── ContentGrid.tsx
    │   ├── cards/                   # Content cards
    │   │   ├── index.ts
    │   │   ├── ContentCard.tsx
    │   │   └── VideoCard.tsx
    │   └── featured/                # Featured content
    │       ├── index.ts
    │       └── FeaturedContent.tsx
    ├── layouts/                     # Layout components
    │   ├── index.ts
    │   ├── MainLayout.tsx
    │   ├── AdminLayout.tsx
    │   ├── AuthLayout.tsx
    │   └── OnboardingLayout.tsx
    ├── media/                       # Media-related components
    │   ├── index.ts
    │   ├── player/                  # Video player components
    │   │   ├── index.ts
    │   │   ├── VideoPlayer.tsx
    │   │   ├── VideoControls.tsx
    │   │   └── QualitySelector.tsx
    │   └── image/                   # Image components
    │       ├── index.ts
    │       └── OptimizedImage.tsx
    ├── navigation/                  # Navigation components
    │   ├── index.ts
    │   ├── Navbar.tsx
    │   ├── MobileNav.tsx
    │   └── NavItem.tsx
    ├── subscription/                # Subscription components
    │   ├── index.ts
    │   ├── PlanSelector.tsx
    │   ├── PaymentForm.tsx
    │   └── SubscriptionManager.tsx
    ├── ui/                          # Generic UI components
    │   ├── index.ts
    │   ├── buttons/                 # Button components
    │   │   ├── index.ts
    │   │   ├── Button.tsx
    │   │   └── IconButton.tsx
    │   ├── forms/                   # Form components
    │   │   ├── index.ts
    │   │   ├── Input.tsx
    │   │   └── Select.tsx
    │   ├── feedback/                # Feedback components
    │   │   ├── index.ts
    │   │   ├── Toast.tsx
    │   │   ├── Alert.tsx
    │   │   └── LoadingSpinner.tsx
    │   ├── overlays/                # Overlay components
    │   │   ├── index.ts
    │   │   └── Modal.tsx
    │   └── pwa/                     # PWA-specific components
    │       ├── index.ts
    │       └── InstallPrompt.tsx
    └── user/                        # User-related components
        ├── index.ts
        ├── profile/                 # Profile components
        │   ├── index.ts
        │   └── UserProfile.tsx
        ├── history/                 # History components
        │   ├── index.ts
        │   └── WatchHistory.tsx
        └── favorites/               # Favorites components
            ├── index.ts
            └── Favorites.tsx
```

## Implementation Strategy

### Step 1: Create the New Directory Structure
Start by creating the base structure while keeping the existing components in place.

### Step 2: Implement Barrel Exports
Create index.ts files for each directory to simplify imports:

Example for ui/buttons/index.ts:
```typescript
export * from './Button';
export * from './IconButton';
```

### Step 3: Move and Refactor Components
Start moving components to their new locations, consolidating duplicates:

1. **Component Naming Conventions**:
   - Use PascalCase for component files
   - Use descriptive names reflecting functionality
   - Be consistent with naming patterns

2. **Component Organization**:
   - Group by domain/functionality first
   - Then by component type if needed
   - Keep related components together

3. **Component Content Guidelines**:
   - One main component per file
   - Related subcomponents can be in the same file if tightly coupled
   - Export both named and default exports for flexibility

### Step 4: Implement Common Patterns
Ensure components follow consistent patterns:

```typescript
// Example Component
import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center',
          // Variant styles
          variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
          variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          variant === 'outline' && 'border border-gray-300 bg-transparent hover:bg-gray-50',
          // Size styles
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="mr-2">Loading...</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
```

### Step 5: Update Imports Across the Codebase
Update imports to use the new structure:

Before:
```typescript
import Button from '../../../components/ui/button';
```

After:
```typescript
import { Button } from '@/components/ui';
// or for more explicit imports
import { Button } from '@/components/ui/buttons';
```

### Step 6: Remove Duplicates
After migrating components to the new structure, identify and eliminate duplicates:

1. Compare components with similar functionality
2. Merge features into a single, flexible component
3. Use composition for complex components
4. Implement proper prop interfaces for type safety

### Step 7: Testing
Write or update tests for refactored components.
