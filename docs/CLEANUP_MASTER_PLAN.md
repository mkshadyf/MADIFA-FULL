# Madifa Codebase Cleanup Master Plan

This master plan outlines a comprehensive, step-by-step approach to clean up the Madifa codebase while maintaining the progressive web app (PWA) functionality with full-scale mobile support.

## Guiding Principles

1. **Don't Repeat Yourself (DRY)**: Eliminate duplicated code and consolidate similar functionality
2. **Single Responsibility**: Each module, component, and service should have a clear, single responsibility
3. **Barrel Exports**: Use index files for simplified imports
4. **Singleton Pattern**: Ensure services use a consistent singleton pattern
5. **Clean Structure**: Maintain a logical, intuitive project structure

## Execution Strategy

Each phase will follow this workflow:
1. **Plan**: Document planned changes
2. **Execute**: Implement changes in a controlled manner
3. **Test**: Verify functionality is preserved
4. **Review**: Confirm changes align with project goals
5. **Document**: Update documentation to reflect changes

## Phase 1: Initial Setup (1-2 days)

### Task 1.1: Create Path Aliases
Update tsconfig.json to include path aliases for simplified imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lib/*": ["src/lib/*"],
      "@pages/*": ["src/pages/*"],
      "@services/*": ["src/lib/services/*"],
      "@utils/*": ["src/lib/utils/*"]
    }
  }
}
```

### Task 1.2: Establish Linting Rules
Update ESLint configuration to enforce consistent patterns:

```json
{
  "rules": {
    "import/no-duplicates": "error",
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external",
        "internal",
        ["parent", "sibling"],
        "index"
      ],
      "pathGroups": [
        {
          "pattern": "@/**",
          "group": "internal"
        }
      ],
      "newlines-between": "always"
    }]
  }
}
```

### Task 1.3: Create Documentation Structure
Set up documentation for tracking changes and progress.

## Phase 2: Service Layer Cleanup (3-5 days)

### Task 2.1: Consolidate Vimeo Services
1. Create `/src/lib/services/vimeo/vimeo-service.ts` as the main service
2. Merge functionality from duplicate files
3. Create proper barrel exports
4. Update imports

### Task 2.2: Consolidate Subscription Services
1. Create `/src/lib/services/subscription/subscription-service.ts` as the main service
2. Merge functionality from duplicate files
3. Create proper barrel exports
4. Update imports

### Task 2.3: Consolidate User Services
1. Review and merge user-related services
2. Create proper barrel exports
3. Update imports

### Task 2.4: Consolidate Authentication Services
1. Review and merge authentication-related services
2. Create proper barrel exports
3. Update imports

### Task 2.5: Standardize Service Pattern
Implement a consistent service pattern:

```typescript
// Standard service pattern
export class ServiceName {
  private static instance: ServiceName;
  
  private constructor() {
    // Private constructor for singleton
  }
  
  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }
  
  // Service methods
}

// Export the singleton instance
export const serviceNameInstance = ServiceName.getInstance();
```

## Phase 3: Component Cleanup (5-7 days)

### Task 3.1: Consolidate Vimeo Components
1. Create `/src/components/admin/vimeo/` directory
2. Merge duplicate Vimeo components
3. Create barrel exports
4. Update imports

### Task 3.2: Consolidate Admin Components
1. Organize admin components by functionality
2. Create proper barrel exports
3. Update imports

### Task 3.3: Consolidate UI Components
1. Review and organize UI component structure
2. Create component categories
3. Implement consistent naming
4. Create barrel exports
5. Update imports

### Task 3.4: Consolidate Content Components
1. Merge duplicate content-related components
2. Create proper barrel exports
3. Update imports

### Task 3.5: Standardize Component Pattern
Implement a consistent component pattern:

```typescript
// Standard component pattern
import React from 'react';
import { cn } from '@/lib/utils';

export interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Component implementation
  return (
    // JSX
  );
};

// For components that need forwardRef
export const Component = React.forwardRef<HTMLElement, ComponentProps>(
  (props, ref) => {
    // Component implementation
    return (
      // JSX
    );
  }
);

Component.displayName = 'Component';
```

## Phase 4: Hooks Cleanup (3-5 days)

### Task 4.1: Categorize Hooks
1. Create hook categories
2. Move hooks to appropriate categories
3. Create barrel exports

### Task 4.2: Consolidate Similar Hooks
1. Identify hooks with similar functionality
2. Merge into unified hooks with options
3. Update imports

### Task 4.3: Standardize Hook Pattern
Implement a consistent hook pattern:

```typescript
// Standard hook pattern
import { useState, useEffect, useCallback } from 'react';

export interface UseHookOptions {
  // Options interface
}

export interface UseHookReturn {
  // Return type interface
}

/**
 * Hook description
 * @param options - Hook options
 * @returns Hook return values and methods
 */
export function useHook(options: UseHookOptions = {}): UseHookReturn {
  // Hook implementation
  
  return {
    // Return values and methods
  };
}
```

## Phase 5: Routing and Pages (3-4 days)

### Task 5.1: Standardize Routing Approach
1. Choose between Next.js app router or React Router
2. Update routing configuration

### Task 5.2: Organize Page Components
1. Standardize page component structure
2. Remove duplicate page components
3. Update imports

## Phase 6: Types and Utilities (2-3 days)

### Task 6.1: Consolidate Type Definitions
1. Review and merge duplicate type definitions
2. Create type hierarchies
3. Create barrel exports

### Task 6.2: Organize Utility Functions
1. Categorize utility functions
2. Remove duplicates
3. Create barrel exports

## Phase 7: Testing and Validation (3-4 days)

### Task 7.1: Test Critical Functionality
1. Verify app installation and updates
2. Test offline functionality
3. Test authentication flow
4. Test content viewing and download
5. Test settings and preferences

### Task 7.2: Performance Validation
1. Run Lighthouse audits
2. Verify bundle size
3. Test load times
4. Verify PWA criteria

## Phase 8: Documentation and Finalization (2-3 days)

### Task 8.1: Update Documentation
1. Update README.md
2. Update PROGRESS.md
3. Create architecture documentation

### Task 8.2: Create Contribution Guidelines
1. Document code style
2. Document development workflow
3. Document testing requirements

## Implementation Timeline

```
Week 1: Phases 1-2
- Setup path aliases and linting rules
- Initial service consolidation

Week 2: Phases 2-3
- Complete service consolidation
- Begin component cleanup

Week 3: Phases 3-4
- Complete component cleanup
- Hook categorization and consolidation

Week 4: Phases 5-6
- Routing standardization
- Type and utility organization

Week 5: Phases 7-8
- Testing and validation
- Documentation and finalization
```

## Risk Mitigation

1. **Backup**: Create a backup branch before starting
2. **Incremental Changes**: Make small, testable changes
3. **Regular Testing**: Test after each significant change
4. **Feature Flags**: Use feature flags for major changes
5. **Rollback Plan**: Have a plan to revert changes if needed

## Success Criteria

1. No duplicate code or components
2. Consistent patterns across the codebase
3. Proper type safety throughout
4. Improved bundle size and performance
5. Maintained PWA functionality
6. Clear, logical project structure
