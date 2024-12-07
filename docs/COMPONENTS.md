# Component Documentation

## Core Components

### AuthProvider
Manages authentication state and provides auth-related functionality throughout the app.

```typescript
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'

// Usage in App
<AuthProvider>
  <App />
</AuthProvider>

// Usage in components
const { user, signIn, signOut } = useAuth()
```

Props: `children: ReactNode`

### AuthGuard
Protects routes based on user authentication and role requirements.

```typescript
import AuthGuard from '@/components/guards/AuthGuard'

<AuthGuard requiredRole="admin">
  <AdminDashboard />
</AuthGuard>
```

Props:
- `children: ReactNode`
- `requiredRole?: string`

### BatchUploader
Handles multiple video uploads with progress tracking.

```typescript
import { BatchUploader } from '@/components/admin/BatchUploader'

<BatchUploader
  onComplete={() => {
    // Handle upload completion
  }}
/>
```

Props:
- `onComplete: () => void`

### ThumbnailManager
Manages video thumbnail generation and upload.

```typescript
import { ThumbnailManager } from '@/components/admin/ThumbnailManager'

<ThumbnailManager
  videoId="123"
  currentThumbnail="https://..."
  onThumbnailUpdate={(url) => {
    // Handle thumbnail update
  }}
/>
```

Props:
- `videoId: string`
- `currentThumbnail?: string`
- `onThumbnailUpdate: (thumbnailUrl: string) => void`

### SecurityManager
Controls video access and embedding settings.

```typescript
import { SecurityManager } from '@/components/admin/SecurityManager'

<SecurityManager
  videoId="123"
  initialSecurity={securityConfig}
  onSecurityUpdate={(security) => {
    // Handle security update
  }}
/>
```

Props:
- `videoId: string`
- `initialSecurity: ContentSecurity`
- `onSecurityUpdate: (security: ContentSecurity) => void`

### RealTimeStats
Displays real-time video analytics.

```typescript
import { RealTimeStats } from '@/components/analytics/RealTimeStats'

<RealTimeStats videoId="123" />
```

Props:
- `videoId: string`

### WorldMap
Visualizes geographic data distribution.

```typescript
import { WorldMap } from '@/components/analytics/WorldMap'

<WorldMap
  data={[
    { id: 'US', value: 100 },
    { id: 'GB', value: 50 }
  ]}
/>
```

Props:
- `data: Array<{ id: string; value: number }>`

## UI Components

### Button
Reusable button component with variants.

```typescript
import { Button } from '@/components/ui/Button'

<Button
  variant="primary"
  size="default"
  onClick={() => {}}
>
  Click me
</Button>
```

Props:
- `variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'`
- `size?: 'default' | 'sm' | 'lg' | 'icon'`
- `asChild?: boolean`
- All HTML button attributes

### Toast
Notification system for user feedback.

```typescript
import { toast } from '@/components/ui/toast'

// Usage
toast.success('Operation completed')
toast.error('Something went wrong')
toast.loading('Processing...')
```

Methods:
- `success(message: string)`
- `error(message: string)`
- `loading(message: string)`
- `dismiss()`

### Loading
Loading indicator with optional fullscreen overlay.

```typescript
import Loading from '@/components/ui/loading'

<Loading
  message="Loading data..."
  fullScreen={true}
  className="custom-class"
/>
```

Props:
- `message?: string`
- `fullScreen?: boolean`
- `className?: string`

### ErrorBoundary
Catches and handles React component errors.

```typescript
import ErrorBoundary from '@/components/ui/error-boundary'

<ErrorBoundary
  onError={(error, errorInfo) => {
    // Handle error
  }}
>
  <ComponentThatMightError />
</ErrorBoundary>
```

Props:
- `children: ReactNode`
- `onError?: (error: Error, errorInfo: React.ErrorInfo) => void`

## Custom Hooks

### useDataFetch
Hook for data fetching with React Query.

```typescript
import { useDataFetch } from '@/hooks/useDataFetch'

const { data, isLoading, error } = useDataFetch(
  'videos',
  () => fetchVideos(),
  {
    onError: (error) => {
      console.error(error)
    }
  }
)
```

### useDataMutation
Hook for data mutations with optimistic updates.

```typescript
import { useDataMutation } from '@/hooks/useDataMutation'

const { mutate, isLoading } = useDataMutation(
  (data) => updateVideo(data),
  {
    invalidateQueries: ['videos'],
    optimisticUpdate: {
      queryKey: ['videos'],
      updateFn: (oldData, newData) => ({
        ...oldData,
        ...newData
      })
    }
  }
)
```

### useVideoAnalytics
Hook for video analytics data.

```typescript
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'

const {
  stats,
  isLoading,
  error
} = useVideoAnalytics('video-id')
```

## Component Best Practices

1. **Error Handling**
   - Always wrap components with ErrorBoundary
   - Use try-catch in async operations
   - Provide meaningful error messages

2. **Performance**
   - Use React.memo for expensive renders
   - Implement proper dependencies in useEffect
   - Avoid unnecessary re-renders

3. **Accessibility**
   - Include ARIA attributes
   - Ensure keyboard navigation
   - Provide proper labels

4. **Testing**
   - Write unit tests for components
   - Include integration tests
   - Test error scenarios 