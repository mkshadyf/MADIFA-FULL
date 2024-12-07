# Deployment Guide

## Prerequisites

1. Node.js >= 18
2. npm >= 9
3. Git
4. Access to deployment platform (e.g., Vercel, AWS, or similar)
5. Required environment variables

## Environment Setup

1. Create environment files for different environments:

```bash
# .env.production
VITE_VIMEO_CLIENT_ID=prod_client_id
VITE_VIMEO_CLIENT_SECRET=prod_client_secret
VITE_VIMEO_ACCESS_TOKEN=prod_access_token
VITE_SUPABASE_URL=prod_supabase_url
VITE_SUPABASE_ANON_KEY=prod_supabase_key
VITE_SENTRY_DSN=prod_sentry_dsn

# .env.staging
VITE_VIMEO_CLIENT_ID=staging_client_id
VITE_VIMEO_CLIENT_SECRET=staging_client_secret
VITE_VIMEO_ACCESS_TOKEN=staging_access_token
VITE_SUPABASE_URL=staging_supabase_url
VITE_SUPABASE_ANON_KEY=staging_supabase_key
VITE_SENTRY_DSN=staging_sentry_dsn
```

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build for production:
```bash
npm run build
```

3. Preview build:
```bash
npm run preview
```

## Deployment Platforms

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### AWS S3 + CloudFront

1. Create S3 bucket:
```bash
aws s3 mb s3://your-bucket-name
```

2. Configure bucket for static hosting:
```bash
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
```

3. Upload build:
```bash
aws s3 sync dist/ s3://your-bucket-name
```

4. Create CloudFront distribution pointing to S3 bucket

### Docker

1. Build image:
```bash
docker build -t madifa:latest .
```

2. Run container:
```bash
docker run -p 3000:3000 madifa:latest
```

## Security Considerations

1. **SSL/TLS**
   - Enable HTTPS
   - Configure SSL certificates
   - Set up proper redirects

2. **Environment Variables**
   - Use secret management service
   - Never commit .env files
   - Rotate secrets regularly

3. **Access Control**
   - Configure CORS properly
   - Set up proper firewall rules
   - Implement rate limiting

## Performance Optimization

1. **CDN Setup**
   - Configure CDN caching
   - Set up proper cache headers
   - Enable compression

2. **Asset Optimization**
   - Enable Brotli compression
   - Configure cache policies
   - Optimize images

## Monitoring

1. **Sentry Setup**
```typescript
// Configure Sentry
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

2. **Performance Monitoring**
```typescript
// Configure web vitals
import { reportWebVitals } from 'web-vitals'

reportWebVitals(console.log)
```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      if: github.ref == 'refs/heads/main'
      run: |
        # Add deployment commands here
```

## Rollback Procedure

1. **Quick Rollback**
```bash
# Using git
git revert HEAD
git push

# Using Vercel
vercel rollback

# Using AWS
aws s3 cp s3://backup-bucket/previous-version/ s3://production-bucket/ --recursive
```

2. **Database Rollback**
```bash
# Using Supabase backup
supabase db restore <backup-id>
```

## Health Checks

1. **API Health Check**
```typescript
// health-check.ts
export const checkHealth = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch {
    return false
  }
}
```

2. **Monitoring Endpoints**
```typescript
// Configure monitoring endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

app.get('/readiness', (req, res) => {
  res.status(200).json({ status: 'ready' })
})
```

## Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Cross-region replication

2. **Asset Backups**
   - S3 versioning
   - Cross-region replication
   - Regular integrity checks

## Troubleshooting

1. **Common Issues**
   - 502 Bad Gateway: Check API server
   - Slow Performance: Check CDN configuration
   - High Error Rate: Check Sentry logs

2. **Debug Tools**
   - Browser DevTools
   - Sentry Error Tracking
   - CloudWatch Logs

## Support

For deployment support:
1. Check documentation
2. Review error logs
3. Contact support team
4. Open GitHub issue 