# MADIFA - Premium Video Streaming Platform

A modern, secure, and feature-rich video streaming platform built with React, Vite, and TypeScript.

## Features

- 🎥 **Video Management**
  - Seamless Vimeo integration
  - Batch upload support
  - Custom thumbnails
  - Advanced security settings

- 📊 **Analytics**
  - Real-time viewer statistics
  - Geographic distribution
  - Performance metrics
  - Custom reports

- 🔒 **Security**
  - Role-based access control
  - Content Security Policy (CSP)
  - Rate limiting
  - XSS protection
  - API security

- 🚀 **Performance**
  - Code splitting
  - Lazy loading
  - Service worker for offline support
  - Optimized bundle size

- 💻 **Developer Experience**
  - TypeScript support
  - Hot module replacement
  - Comprehensive testing setup
  - Modern tooling

## Prerequisites

- Node.js >= 18
- npm >= 9
- Git

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_VIMEO_CLIENT_ID=your_vimeo_client_id
VITE_VIMEO_CLIENT_SECRET=your_vimeo_client_secret
VITE_VIMEO_ACCESS_TOKEN=your_vimeo_access_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/madifa.git
cd madifa
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Testing

- Run unit tests:
```bash
npm test
```

- Run E2E tests:
```bash
npm run test:e2e
```

- Run tests with UI:
```bash
npm run test:ui
```

## Project Structure

```
madifa/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Core utilities and services
│   ├── pages/         # Page components
│   ├── routes/        # Route configuration
│   ├── types/         # TypeScript type definitions
│   └── test/          # Test utilities and setup
├── public/            # Static assets
├── e2e/              # End-to-end tests
└── scripts/          # Build and utility scripts
```

## Core Components

### Authentication
- `AuthProvider`: Manages user authentication state
- `AuthGuard`: Protects routes based on user roles
- `useAuth`: Hook for authentication operations

### Video Management
- `BatchUploader`: Handles multiple video uploads
- `ThumbnailManager`: Manages video thumbnails
- `SecurityManager`: Controls video access settings

### Analytics
- `RealTimeStats`: Shows live viewer statistics
- `WorldMap`: Displays geographic distribution
- `PerformanceDashboard`: Monitors application metrics

## API Integration

### Vimeo Service
```typescript
import { vimeoService } from '@/lib/services/vimeo'

// Upload video
await vimeoService.uploadVideo(file, {
  name: 'My Video',
  description: 'Video description',
  privacy: { view: 'disable' }
})

// Generate signed URL
await vimeoService.generateSignedUrl(videoId, {
  expires_in: 3600,
  domain_verification: true
})
```

### API Service
```typescript
import { apiService } from '@/lib/services/api'

// Make API request
const data = await apiService.request('/api/videos')
```

## Security

The application implements several security measures:

1. Content Security Policy (CSP)
2. Rate limiting for API endpoints
3. XSS protection
4. HTTP security headers
5. API request sanitization

## Performance Optimization

1. Code splitting via React.lazy()
2. Service worker for offline support
3. Bundle optimization
4. Image optimization
5. Caching strategies

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 