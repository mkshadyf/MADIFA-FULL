# API Documentation

## Authentication

### Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": string,
  "password": string
}

Response:
{
  "user": {
    "id": string,
    "email": string,
    "role": "admin" | "user"
  },
  "session": {
    "access_token": string,
    "expires_at": string
  }
}
```

### Register
```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": string,
  "password": string,
  "full_name": string
}

Response:
{
  "user": {
    "id": string,
    "email": string
  },
  "message": "Verification email sent"
}
```

## Video Management

### Upload Video
```typescript
POST /api/videos/upload
Content-Type: multipart/form-data

Form Data:
- file: File
- name: string
- description?: string
- privacy?: {
    view: "anybody" | "disable" | "unlisted"
    embed?: "public" | "private"
    comments?: "anybody" | "nobody"
    download?: boolean
  }

Response:
{
  "id": string,
  "uri": string,
  "status": "uploading" | "transcoding" | "complete"
}
```

### Get Video
```typescript
GET /api/videos/:id

Response:
{
  "id": string,
  "name": string,
  "description": string,
  "duration": number,
  "status": string,
  "privacy": {
    "view": string,
    "embed": string
  },
  "pictures": {
    "base_link": string,
    "sizes": Array<{
      "width": number,
      "height": number,
      "link": string
    }>
  }
}
```

### Update Video Security
```typescript
PATCH /api/videos/:id/security
Content-Type: application/json

{
  "privacy": {
    "view": "anybody" | "disable" | "unlisted",
    "embed": "public" | "private",
    "comments": "anybody" | "nobody",
    "download": boolean
  },
  "embed_settings": {
    "buttons": {
      "like": boolean,
      "share": boolean,
      "embed": boolean
    },
    "logos": {
      "vimeo": boolean,
      "custom": {
        "active": boolean,
        "url": string
      }
    }
  },
  "domain_restrictions": {
    "whitelist_enabled": boolean,
    "allowed_domains": string[]
  }
}

Response:
{
  "success": true,
  "message": "Security settings updated"
}
```

## Analytics

### Get Real-time Stats
```typescript
GET /api/analytics/realtime/:videoId

Response:
{
  "currentViewers": number,
  "peakViewers": number,
  "bufferingCount": number,
  "qualityDistribution": {
    "1080p": number,
    "720p": number,
    "480p": number,
    "360p": number
  },
  "activeRegions": Array<{
    "country": string,
    "viewers": number
  }>,
  "lastMinuteEvents": Array<{
    "type": string,
    "timestamp": string,
    "data": object
  }>
}
```

### Get Analytics Report
```typescript
GET /api/analytics/reports
Query Parameters:
- startDate: string (ISO date)
- endDate: string (ISO date)
- videoId?: string
- metrics?: string[]

Response:
{
  "period": {
    "from": string,
    "to": string
  },
  "stats": {
    "totalViews": number,
    "uniqueViewers": number,
    "averageViewDuration": number,
    "completionRate": number
  },
  "geographicDistribution": Array<{
    "country": string,
    "views": number,
    "uniqueViewers": number
  }>,
  "timeDistribution": Array<{
    "hour": number,
    "views": number,
    "engagement": number
  }>
}
```

## Error Handling

All API endpoints follow this error response format:

```typescript
{
  "error": {
    "code": string,
    "message": string,
    "status": number,
    "details?: object
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid request data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_ERROR`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- Upload endpoints: 10 requests per hour
- General API endpoints: 100 requests per 15 minutes

## Security Headers

All API responses include these security headers:
```
Content-Security-Policy: [CSP directives]
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
``` 