# Project Rules

## Project Overview
Madifa is a content management and delivery platform built with React, TypeScript, and Next.js. The application allows users to manage, organize, and deliver video content through various channels.

## Architecture Overview
- **Frontend**: React with TypeScript
- **Routing**: Next.js
- **State Management**: React Context API and custom hooks
- **API Integration**: Custom API client with interceptors
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Video Integration**: Vimeo API
- **Payment Processing**: Stripe

## Coding Standards

### TypeScript
- Use strict type checking
- Avoid using `any` type when possible
- Define interfaces for all data structures
- Use type guards for runtime type checking
- Create type declarations for external modules

### React
- Use functional components with hooks
- Follow React best practices for performance optimization
- Implement proper error boundaries
- Use React Context for global state management
- Follow accessibility guidelines (WCAG 2.1)

### File Organization
- Components should be organized by feature or domain
- Shared components should be placed in the `components/ui` directory
- Hooks should be placed in the `hooks` directory
- Services should be placed in the `lib/services` directory
- Types should be placed in the `types` directory

### Testing Requirements
- Unit tests for critical business logic
- Component tests for UI components
- Integration tests for key user flows
- End-to-end tests for critical paths

### Documentation Expectations
- All components should have JSDoc comments
- All functions should have parameter and return type annotations
- Complex logic should be documented with inline comments
- API endpoints should be documented with OpenAPI specifications

## Project Memory

### Active Focus Areas
- [TypeScript Errors]: Fixed all TypeScript errors in the project
- [ESLint Errors]: Working on fixing ESLint errors and warnings

### Recent Key Decisions
- [Type Declarations] Created type declarations for missing modules on 2025-03-16 because they were causing TypeScript errors
- [UI Components] Created missing UI components (NavItem, Navbar) on 2025-03-16 because they were referenced but not implemented

### Architecture Constraints
- [Next.js]: The project uses Next.js for routing and server-side rendering
- [Supabase]: The project uses Supabase for authentication and database
- [Vimeo]: The project uses Vimeo for video hosting and delivery
- [Stripe]: The project uses Stripe for payment processing 