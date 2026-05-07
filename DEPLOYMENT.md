# Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the Adarsha Pathasala Data Management System in production environments. The application consists of a Node.js backend API and a React frontend PWA, designed for scalable deployment across various platforms.

## Prerequisites

### System Requirements
- **Node.js**: Version 16.0 or higher
- **Database**: Supabase account (PostgreSQL)
- **Notifications**: Firebase project with FCM enabled
- **SSL Certificate**: Required for production HTTPS

### Infrastructure Options
- **VPS/Cloud VM**: AWS EC2, DigitalOcean, Linode
- **Container Platforms**: Docker, Kubernetes
- **Managed Services**: Heroku, Railway, Render, Vercel
- **Serverless**: AWS Lambda, Vercel Functions

## Pre-Deployment Checklist

### Security Configuration
- [ ] HTTPS/TLS certificates configured
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] CORS origins restricted to production domains
- [ ] Service role keys never exposed to frontend
- [ ] Rate limiting enabled (default: 180 requests/minute)

### Application Configuration
- [ ] Supabase project created and credentials verified
- [ ] Firebase project configured with FCM
- [ ] Admin bootstrap credentials set
- [ ] Database migrations tested locally
- [ ] Frontend build tested successfully

### Monitoring & Logging
- [ ] Health check endpoint accessible
- [ ] Error logging configured
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented

## Repository Preparation

### Clean Repository for Deployment

```bash
# Remove development artifacts
rm -rf node_modules/
rm -rf frontend/node_modules/
rm -rf frontend/dist/

# Ensure .env files are not committed
git status
# Verify no .env files are staged
```

### Environment Variables Setup

Create production `.env` files from templates:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

## Deployment Strategies

### Option 1: Traditional VPS/VM

#### 1. Server Provisioning

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/adarsha-pathasala.git /var/www/adarsha-pathasala
cd /var/www/adarsha-pathasala

# Install dependencies
npm install
cd frontend && npm install && cd ..

# Configure environment
nano backend/.env  # Add production values
nano frontend/.env # Add production values

# Build frontend
npm run build

# Start application
pm2 start "npm start" --name adarsha-pathasala
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/adarsha-pathasala
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Containerization

#### Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci && cd frontend && npm ci && cd ..

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Docker Compose (Optional)

```yaml
version: '3.8'
services:
  adarsha-pathasala:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      # Add other environment variables
    restart: unless-stopped
```

#### Deployment Commands

```bash
# Build and run
docker build -t adarsha-pathasala .
docker run -d -p 3000:3000 --env-file backend/.env adarsha-pathasala

# Or with Docker Compose
docker-compose up -d
```

### Option 3: Managed Platform Services

#### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create adarsha-pathasala

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your-supabase-url
# Add other required variables

# Deploy
git push heroku main
```

#### Railway/Render Deployment

1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Configure environment variables in dashboard
5. Deploy automatically on push

## Environment Variables Reference

### Backend Configuration

| Variable | Production Value | Description |
|----------|------------------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `APP_ORIGIN` | `https://your-domain.com` | Frontend domain |
| `REQUIRE_AUTH` | `true` | Enable authentication |
| `SUPABASE_URL` | Your Supabase URL | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Admin database access |
| `FIREBASE_PROJECT_ID` | Your Firebase ID | FCM project |
| `AUTO_RUN_MIGRATIONS` | `true` | Run DB migrations on start |

### Frontend Configuration

| Variable | Production Value | Description |
|----------|------------------|-------------|
| `VITE_API_BASE_URL` | `https://your-api-domain.com/api` | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Your Firebase key | FCM client key |

## Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl https://your-domain.com/health

# Expected response
{
  "status": "ok",
  "service": "adarsha-pathasala",
  "supabase": "configured",
  "firebase": "configured"
}
```

### Functional Testing

1. **Authentication**: Verify login works
2. **PWA Installation**: Check app can be installed
3. **Push Notifications**: Test FCM delivery
4. **Offline Mode**: Verify cached data access
5. **Responsive Design**: Test on mobile devices

### Performance Monitoring

```bash
# Check application logs
pm2 logs adarsha-pathasala

# Monitor resource usage
pm2 monit

# Check application status
pm2 status
```

## Security Best Practices

### Network Security
- Use HTTPS exclusively
- Implement proper CORS policies
- Configure security headers (CSP, HSTS)
- Rate limit API endpoints

### Data Protection
- Encrypt sensitive environment variables
- Use secure database connections (SSL)
- Implement proper session management
- Regular security audits

### Access Control
- Restrict admin endpoints
- Implement proper RBAC
- Monitor authentication attempts
- Use secure password policies

## Backup and Recovery

### Database Backup
- Configure automated Supabase backups
- Export critical data regularly
- Test restore procedures

### Application Backup
- Version control all code changes
- Document configuration changes
- Maintain deployment scripts

## Troubleshooting

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| CORS Error | Frontend can't connect to API | Check `APP_ORIGIN` matches frontend domain |
| FCM Not Working | No push notifications | Verify Firebase config and VAPID key |
| Build Failures | Frontend doesn't load | Check Node.js version and dependencies |
| Database Errors | App crashes on startup | Verify Supabase credentials and network |

### Monitoring Commands

```bash
# Check application logs
pm2 logs adarsha-pathasala --lines 100

# Restart application
pm2 restart adarsha-pathasala

# Check system resources
htop
df -h
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor error logs weekly
- Backup data regularly
- Test deployment process quarterly

### Updates
1. Test changes in staging environment
2. Deploy during low-traffic periods
3. Monitor application after deployment
4. Rollback if issues detected

## Support

For deployment issues, check:
- Application logs (`pm2 logs`)
- Health endpoint (`/health`)
- Supabase dashboard
- Firebase console

Contact the development team for assistance with complex deployments.
- `SUPABASE_DB_URL`
- `SUPABASE_DB_SSL`
- `AUTO_RUN_MIGRATIONS`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `PUBLIC_FIREBASE_API_KEY` or `VITE_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN` or `VITE_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID` or `VITE_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET` or `VITE_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` or `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID` or `VITE_FIREBASE_APP_ID`
- `PUBLIC_FIREBASE_VAPID_KEY` or `VITE_FIREBASE_VAPID_KEY`

## Checklist before pushing to GitHub

- [ ] `backend/.env` is not committed
- [ ] `frontend/.env` is not committed
- [ ] `node_modules/` removed
- [ ] `frontend/dist/` ignored
- [ ] Project builds successfully with `npm run build`
- [ ] Backend starts successfully with `npm start`
- [ ] Health endpoint responds at `/health`

## Quick verification

```bash
npm run build
npm start
curl http://localhost:3000/health
```
   
   # Configure reverse proxy (nginx/apache) with certificate
   ```

5. **Verify Deployment**
   ```bash
   curl https://your-backend-domain.com/health
   # Should return: { "status": "ok" }
   ```

### Phase 4: Frontend Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   # Output: public/ folder (pre-built)
   ```

2. **Deploy Built Application**
   Choose your deployment method:

   **Option A: Static Host (Deploy only `public/` folder)**
   ```bash
   # Upload public/ folder contents to:
   # - GitHub Pages
   # - Netlify (drag & drop)
   # - AWS S3
   # - Cloudflare Pages
   # - Azure Static Web Apps
   # - Vercel
   
   # OR from command line:
   cd frontend
   npm run build
   # Upload public/ folder via your host's CLI
   ```

   **Option B: Traditional VPS**
   ```bash
   # SSH into server
   ssh user@your-frontend-server
   
   # Clone repository and build
   git clone <your-repo-url> /var/www/adarsha-app
   cd /var/www/adarsha-app
   cd frontend
   npm install
   npm run build
   
   # Copy built files to web server directory
   sudo cp -r public/* /var/www/html/
   
   # Configure nginx/apache (see below)
   ```

   **Option C: Container (Docker)**
   ```bash
   # Create Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY frontend .
   RUN npm install && npm run build
   
   # Build and run
   docker build -t adarsha-app .
   docker run -d -p 80:80 --name adarsha-app adarsha-app
   ```

   **Option D: Managed Platform (Netlify, Vercel, etc.)**
   - Connect GitHub repository to platform
   - Build command: `cd frontend && npm run build`
   - Publish directory: `public/`
   - Add environment variables below

3. **Environment Variables**
   ```
   VITE_FIREBASE_API_KEY=<FROM_FIREBASE>
   VITE_FIREBASE_AUTH_DOMAIN=<FROM_FIREBASE>
   VITE_FIREBASE_PROJECT_ID=<FROM_FIREBASE>
   VITE_FIREBASE_STORAGE_BUCKET=<FROM_FIREBASE>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<FROM_FIREBASE>
   VITE_FIREBASE_APP_ID=<FROM_FIREBASE>
   VITE_FIREBASE_VAPID_KEY=<FROM_FIREBASE>
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

4. **Nginx Configuration** (For VPS deployment)
   ```nginx
   server {
     listen 80;
     server_name your-frontend-domain.com;
     
     # Redirect HTTP to HTTPS
     return 301 https://$server_name$request_uri;
   }
   
   server {
     listen 443 ssl http2;
     server_name your-frontend-domain.com;
     
     ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;
     
     root /var/www/html;
     index index.html;
     
     # SPA routing: all routes serve index.html
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     # Cache static assets
     location ~* \.(js|css|png|jpg|svg|woff2)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

5. **Setup SSL/TLS Certificate**
   ```bash
   # For VPS
   sudo certbot certonly --standalone -d your-frontend-domain.com
   ```

6. **Verify Deployment**
   ```bash
   # Visit your domain
   https://your-frontend-domain.com
   # Should load login page
   ```

### Phase 5: Cross-Domain Configuration

1. **Backend Update**
   - Set environment variable:
     ```
     APP_ORIGIN=https://your-frontend-domain.com
     ```
   - Restart backend service

2. **Frontend Update**
   - Rebuild and redeploy with:
     ```
     VITE_API_BASE_URL=https://your-backend-domain.com/api
     ```

3. **Test Communication**
   ```bash
   # From frontend domain, test backend connection
   curl https://your-backend-domain.com/api/config
   ```

## 🔒 Production Security Hardening

### SSL/TLS Certificates

```bash
# Both domains MUST have valid HTTPS
# Use Let's Encrypt (free)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com

# Or use your hosting provider's certificate service
# Verify: https://ssl-checker.xyz
```

### Environment Variable Security

```bash
# ✅ DO: Sensitive only in backend
SUPABASE_SERVICE_ROLE_KEY=xxx
FIREBASE_PRIVATE_KEY=xxx

# ❌ DON'T: Never expose to frontend
# (All keys prefixed with VITE_ are exposed)
```

### Rate Limiting

```javascript
// Backend already configured:
- 15 requests per minute per IP
- 100 requests per hour per user
- Applies to all public endpoints
```

### CORS Restrictions

```javascript
// Configured to accept only:
- Frontend domain (from APP_ORIGIN)
- Localhost (for development)
// Rejects all other origins
```

### Database Security

```sql
-- Supabase Row-Level Security (RLS)
-- Enable on all tables:

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example: Users see only their own data
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = auth_user_id);
```

## 📊 Monitoring & Logging

### Backend Logs

```bash
# For PM2 (VPS)
pm2 logs adarsha-api

# For Docker
docker logs adarsha-api

# For systemd
sudo journalctl -u adarsha-api -f

# Check application logs
cat /var/www/adarsha-api/logs/error.log
```

### Frontend Monitoring

```javascript
// Add error tracking (optional):
// Sentry, LogRocket, or similar service

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### Database Monitoring (Supabase)

- Dashboard → Logs
- Monitor slow queries
- Check row counts
- Monitor real-time users

## 🔄 Continuous Deployment

### Webhook Auto-Deployment (VPS)

```bash
# Create deploy script: /var/www/deploy.sh
#!/bin/bash
cd /var/www/adarsha-api
git pull origin main
npm install
npm run db:setup
pm2 restart adarsha-api

# Make executable
chmod +x /var/www/deploy.sh

# Setup webhook on GitHub
# Settings → Webhooks → Payload URL: https://your-server.com/webhook/deploy
# Create webhook receiver script to trigger deploy.sh
```

### GitHub Actions (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Test backend
        run: cd backend && npm install && npm run check
      
      - name: Build frontend
        run: cd frontend && npm install && npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: /var/www/deploy.sh
```

## 🧪 Production Testing

### Pre-Launch Checklist

```bash
# 1. Test login
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@adarshapathasala.edu","password":"YourPassword"}'

# 2. Test API protection
curl -H "Authorization: Bearer INVALID_TOKEN" \
  https://your-backend-domain.com/api/students
# Should return: 401 Unauthorized

# 3. Test CORS
curl -H "Origin: https://attacker.com" \
  https://your-backend-domain.com/api/config
# Should not include CORS headers

# 4. Test FCM setup
# Visit frontend → Grant notification permission
# Check browser DevTools for FCM token registration

# 5. Load test (optional)
# Use k6, LoadImpact, or similar
# Simulate 100+ concurrent users
```

## 🚨 Incident Response

### If Backend Is Down

```bash
# 1. Check application logs
pm2 logs adarsha-api  # or docker logs, systemctl status

# 2. Verify environment variables
cat /var/www/adarsha-api/.env

# 3. Check Supabase connection
curl https://your-supabase-url/rest/v1/

# 4. Restart service
pm2 restart adarsha-api  # or docker restart, systemctl restart

# 5. If database is down:
# - Frontend can serve cached data
# - Users get "offline mode" message
# - Auto-syncs when connection restored
```

### If Frontend Is Down

```bash
# 1. Check web server logs
sudo tail -f /var/log/nginx/error.log

# 2. Verify files are deployed
ls -la /var/www/html/

# 3. Test web server
curl https://your-frontend-domain.com

# 4. Restart web server
sudo systemctl restart nginx  # or apache2

# 5. Check browser console for JavaScript errors
```

### If FCM Is Down

```bash
# 1. Notifications won't deliver immediately
# 2. They queue in backend database
# 3. Auto-retry when FCM recovers
# 4. Users notified when connection restored
```

## 📈 Scaling for Growth

### When to Scale

| Metric | Action |
|--------|--------|
| >500 users | Add caching layer (Redis) |
| >10k requests/day | Add CDN for static files |
| >5000 concurrent | Load balance backend |
| >100GB data | Archive old notifications |

### Scaling Steps

1. **Add Redis** (for session cache)
   ```bash
   # Install Redis on separate server
   sudo apt-get install redis-server
   
   # Update backend to use Redis
   # Add REDIS_URL to environment variables
   ```

2. **Add CDN** (Cloudflare, AWS CloudFront, Akamai)
   ```bash
   # Point frontend domain to CDN
   # Cache static assets (JS, CSS, fonts)
   # Configure cache TTL
   ```

3. **Load Balancing** (nginx, HAProxy, AWS ALB)
   ```bash
   # Setup load balancer in front of multiple backend instances
   # Use health checks to detect down servers
   # Distribute traffic evenly
   ```

## 📚 Post-Deployment

### User Communication

Send email to all teachers/parents:

```
Subject: Adarsha Pathasala App is Live!

Dear Teachers & Parents,

The new Adarsha Pathasala Data Management System is now live!

🔗 Access here: https://your-frontend-domain.com

📱 Works on all devices - install as app on your phone!

🔐 Login with:
   - Email: your-email@example.com
   - Password: (sent separately)

❓ Issues? Contact IT: support@adarshapathasala.com

Best regards,
Administration
```

### First Week Monitoring

- [ ] Monitor error logs daily
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Verify notifications deliver
- [ ] Check cache hit rates
- [ ] Monitor authentication issues

---

**Deployment Completed!** Your production system is ready. 🎉