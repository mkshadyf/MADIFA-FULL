# Component Organization Guidelines

This document outlines the standardized component organization pattern for the Madifa application.

## Directory Structure

```
src/components/
├── ui/                 # Reusable UI components
│   ├── Button/
│   │   ├── index.ts    # Re-exports from the directory
│   │   ├── Button.tsx  # Main component implementation
│   │   ├── Button.test.tsx  # Component tests
│   │   └── Button.module.css  # Component-specific styles (if not using Tailwind)
│   └── ...
├── features/           # Feature-specific components
│   ├── VideoPlayer/
│   │   ├── index.ts
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoControls.tsx  # Sub-components
│   │   ├── VideoProgress.tsx
│   │   └── types.ts    # Feature-specific types
│   └── ...
├── layout/             # Layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── Footer/
│   └── ...
├── forms/              # Form components and form-related utilities
│   ├── FormFields/
│   ├── Validation/
│   └── ...
└── modals/             # Modal components
    ├── ConfirmationModal/
    ├── VideoUploadModal/
    └── ...
```

## Component File Structure

Each component should follow this structure:

```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import type { FC } from 'react';

// 2. Types
interface ComponentProps {
  // Props definition
}

// 3. Component definition
export function Component({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Handle events
  };
  
  // Render helpers (optional)
  const renderSomething = () => {
    return <div>...</div>;
  };
  
  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Naming Conventions

- **Component Files**: PascalCase (e.g., `Button.tsx`, `VideoPlayer.tsx`)
- **Component Directories**: PascalCase (e.g., `Button/`, `VideoPlayer/`)
- **Utility Files**: camelCase (e.g., `utils.ts`, `helpers.ts`)
- **Test Files**: Same name as the component with `.test.tsx` suffix
- **Style Files**: Same name as the component with `.module.css` suffix

## Export Pattern

Each component directory should have an `index.ts` file that re-exports the component and its types:

```ts
// index.ts
export * from './Component';
export * from './types';
```

This allows for clean imports:

```tsx
import { Component, ComponentProps } from '@components/Component';
```

## Component Documentation

Each component should include JSDoc comments that describe:

1. The purpose of the component
2. Props and their descriptions
3. Usage examples

Example:

```tsx
/**
 * Button component for user interactions
 * 
 * @param {string} variant - The button style variant
 * @param {boolean} isLoading - Whether the button is in loading state
 * @param {ReactNode} children - The button content
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({ variant, isLoading, children }: ButtonProps) {
  // ...
}
```

## Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Composition Over Inheritance**: Prefer component composition over inheritance
3. **Controlled Components**: Form components should be controlled when possible
4. **Prop Spreading**: Avoid prop spreading (`{...props}`) when possible
5. **Default Props**: Use default parameter values instead of defaultProps
6. **Conditional Rendering**: Use ternary operators for simple conditions
7. **Error Boundaries**: Wrap complex components with error boundaries
8. **Accessibility**: Ensure components meet accessibility standards
9. **Performance**: Use memoization (React.memo, useMemo, useCallback) when appropriate
10. **Testing**: Write tests for component behavior, not implementation details 