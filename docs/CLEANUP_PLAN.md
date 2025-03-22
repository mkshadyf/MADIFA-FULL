# Codebase Cleanup Plan

## Principles to Follow
- **DRY (Don't Repeat Yourself)**: Eliminate duplicate code and functionality
- **Barrel Exports**: Use index files to simplify imports
- **Singleton Pattern**: Ensure services are implemented as singletons
- **Modularized Architecture**: Group related functionality together

## Identified Issues

### 1. Duplicate Files and Components
- Multiple implementations of similar components (e.g., vimeo-related components)
- Redundant service implementations
- Overlapping functionality between hooks

### 2. Inconsistent File Structure
- Mix of Next.js and React Router patterns
- Inconsistent naming conventions (camelCase, kebab-case, PascalCase)
- Nested directories with single files

### 3. Bloated Directories
- Overly nested component structure
- Too many hooks with similar purposes
- Fragmented service implementations

## Cleanup Action Plan

### Phase 1: Consolidate Duplicate Components
1. **Vimeo Components**
   - Merge all vimeo-related components into a single location
   - Create consistent API for these components
   - Use barrel exports for simplified imports

2. **Admin Components**
   - Consolidate duplicated admin functionality
   - Create proper component hierarchy

3. **UI Components**
   - Standardize UI component naming and organization
   - Create a proper component library structure

### Phase 2: Service Rationalization
1. **Consolidate Service Implementations**
   - Move all service implementations to lib/services
   - Ensure each service follows singleton pattern
   - Use proper dependency injection

2. **API Client Standardization**
   - Create a single, consistent API client implementation
   - Standardize error handling across all API calls

### Phase 3: Type System Cleanup
1. **Centralize Type Definitions**
   - Move all types to a centralized location
   - Eliminate duplicate type definitions
   - Create proper type hierarchies

2. **Improve Type Coverage**
   - Ensure all components have proper types
   - Add missing type definitions

### Phase 4: Module Organization
1. **Page Structure Cleanup**
   - Standardize on either Next.js or React Router pattern
   - Consistent file naming convention

2. **Hook Consolidation**
   - Merge similar hooks
   - Create hook categories
   - Improve hook documentation

### Phase 5: Directory Structure Optimization
1. **Flatten Where Possible**
   - Reduce unnecessary nesting
   - Create logical groupings

2. **Normalize Naming Conventions**
   - Consistent use of kebab-case for files
   - Consistent use of PascalCase for components
   - Consistent use of camelCase for functions and variables

## Implementation Strategy
1. Create a staging branch for major refactoring
2. Start with the most isolated components
3. Move systematically through each phase
4. Write comprehensive tests for refactored code
5. Conduct thorough regression testing

## Expected Benefits
- **Improved Developer Experience**: Easier to find and understand code
- **Better Performance**: Reduced duplication means less code to load
- **Enhanced Maintainability**: Clearer structure makes maintenance easier
- **Easier Onboarding**: New developers can understand the codebase more quickly
