# TypeScript Fixes Needed

This document tracks TypeScript issues that need to be addressed in the codebase.

## Current ESLint Errors

The following files have ESLint errors that prevent commits and require fixes:

### Critical (Errors)

1. **src/hooks/useThrottle.ts**
   - Missing react-hooks/exhaustive-deps rule definition
   - Uses `any` types that should be more specific

2. **src/hooks/useKeyPress.ts**
   - Multiple 'EventListener' is not defined errors

### High Priority (Warnings)

1. **src/hooks/useVideoPlayer.ts**
   - Multiple instances of `any` types that should be replaced with specific types

2. **src/types/modules.d.ts**
   - Many `any` types that should be replaced with more specific types

3. **src/types/vimeo-client.d.ts**
   - `any` types that should be replaced with more specific types

## How to Commit Changes While Fixing These Issues

To commit changes while working on these TypeScript issues, you can temporarily bypass Git hooks:

```bash
# For commits
git commit -m "Your commit message" --no-verify

# For pushing
git push --no-verify
```

## Long-term Solution

1. Install missing ESLint rules:
   ```bash
   npm install --save-dev eslint-plugin-react-hooks
   ```

2. Update TypeScript definitions to include proper types for:
   - EventListener
   - NodeJS namespace
   - React.DependencyList
   - ResponseInit

3. Replace `any` types with proper explicit types throughout the codebase

## Progress Tracking

- [ ] Fix useThrottle.ts errors
- [ ] Fix useKeyPress.ts errors
- [ ] Fix useVideoPlayer.ts warnings
- [ ] Fix modules.d.ts warnings
- [ ] Fix vimeo-client.d.ts warnings 