# Environment Configuration Guide

This project uses environment-based configuration to automatically switch between development and production URLs.

## 🔧 Environment Files

### Backend Environment (`backend/env.example`)
```bash
# Environment Configuration
ENVIRONMENT_TYPE=dev

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=true
FLASK_HOST=127.0.0.1
FLASK_PORT=5000

# Security
SECRET_KEY=dev-secret-key-change-in-production

# Server URLs - Will be determined by ENVIRONMENT_TYPE
# Development URLs (default)
BACKEND_URL_DEV=http://127.0.0.1:5000
FRONTEND_URL_DEV=http://localhost:3000

# Production URLs
BACKEND_URL_PROD=https://desirable-gentleness-production.up.railway.app
FRONTEND_URL_PROD=https://global-hackathon-v1-production.up.railway.app
```

### Frontend Environment (`frontend/env.example`)
```bash
# Environment Configuration
VITE_ENVIRONMENT_TYPE=dev

# Server URLs - Will be determined by VITE_ENVIRONMENT_TYPE
# Development URLs (default)
VITE_BACKEND_URL_DEV=http://127.0.0.1:5000
VITE_FRONTEND_URL_DEV=http://localhost:3000

# Production URLs
VITE_BACKEND_URL_PROD=https://desirable-gentleness-production.up.railway.app
VITE_FRONTEND_URL_PROD=https://global-hackathon-v1-production.up.railway.app

# App Configuration
VITE_APP_NAME=Hackathon App
VITE_APP_VERSION=1.0.0
```

## 🚀 Setup Instructions

### 1. Copy Environment Files
```bash
# Backend
cd backend
cp env.example .env

# Frontend
cd ../frontend
cp env.example .env
```

### 2. Configure Environment Type

#### For Development (Default)
```bash
# Backend .env
ENVIRONMENT_TYPE=dev

# Frontend .env
VITE_ENVIRONMENT_TYPE=dev
```

#### For Production
```bash
# Backend .env
ENVIRONMENT_TYPE=prod

# Frontend .env
VITE_ENVIRONMENT_TYPE=prod
```

## 🔄 How It Works

### Backend Configuration (`config.py`)
- Reads `ENVIRONMENT_TYPE` from environment variables
- Automatically selects URLs based on environment:
  - `dev`: Uses localhost URLs
  - `prod`: Uses production URLs
- Dynamic CORS configuration based on environment

### Frontend Configuration (`src/config/environment.ts`)
- Reads `VITE_ENVIRONMENT_TYPE` from Vite environment variables
- Provides helper functions:
  - `getApiUrl(endpoint)` - Gets full API URL
  - `isDevelopment()` - Checks if in dev mode
  - `isProduction()` - Checks if in prod mode

## 📱 Usage Examples

### Frontend API Calls
```typescript
import { getApiUrl } from '../config/environment';

// Automatically uses correct URL based on environment
fetch(getApiUrl('/api/health'))
  .then(response => response.json())
  .then(data => console.log(data));
```

### Backend URL Access
```python
from config import config

# Get current backend URL
backend_url = config.BACKEND_URL

# Get current frontend URL  
frontend_url = config.FRONTEND_URL

# Check environment
is_prod = config.ENVIRONMENT_TYPE == 'prod'
```

## 🌐 URL Mapping

### Development Environment (`ENVIRONMENT_TYPE=dev`)
- **Backend**: `http://127.0.0.1:5000`
- **Frontend**: `http://localhost:3000`
- **CORS**: Allows localhost origins

### Production Environment (`ENVIRONMENT_TYPE=prod`)
- **Backend**: `https://desirable-gentleness-production.up.railway.app`
- **Frontend**: `https://global-hackathon-v1-production.up.railway.app`
- **CORS**: Allows production origins + localhost for testing

## 🐳 Docker Integration

### Docker Compose Environment Variables
```yaml
services:
  backend:
    environment:
      - ENVIRONMENT_TYPE=prod
      - FLASK_ENV=production
      - LOG_LEVEL=INFO
```

### Dockerfile Environment
```dockerfile
# Set production environment
ENV ENVIRONMENT_TYPE=prod
ENV FLASK_ENV=production
```

## 🔍 Debugging

### Check Current Configuration
```typescript
// Frontend - Check in browser console
import { config } from './config/environment';
console.log('Current config:', config);
```

```python
# Backend - Add to app.py for debugging
from config import config
print(f"Environment: {config.ENVIRONMENT_TYPE}")
print(f"Backend URL: {config.BACKEND_URL}")
print(f"Frontend URL: {config.FRONTEND_URL}")
```

### Environment Variable Override
You can override any URL by setting the specific environment variable:

```bash
# Override backend URL for testing
VITE_BACKEND_URL_DEV=http://localhost:8000
```

## ⚠️ Important Notes

1. **Frontend Environment Variables**: Must be prefixed with `VITE_` to be accessible in the browser
2. **Security**: Never commit `.env` files with production secrets
3. **CORS**: Production CORS includes localhost for testing purposes
4. **Default Behavior**: If no environment type is set, defaults to `dev`

## 🚀 Deployment

### Railway Deployment
Set these environment variables in Railway:
```bash
ENVIRONMENT_TYPE=prod
FLASK_ENV=production
LOG_LEVEL=INFO
```

### Local Development
```bash
ENVIRONMENT_TYPE=dev
FLASK_ENV=development
LOG_LEVEL=DEBUG
```

This configuration system ensures seamless switching between development and production environments without code changes!
