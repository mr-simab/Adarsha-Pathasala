# Adarsha Pathasala Data Management System

[![Node.js Version](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

A Progressive Web Application (PWA) designed for efficient Institution data management, including attendance tracking, fee management, study notes distribution, and real-time push notifications for parents and students.

##  Key Features

- **Progressive Web App**: Installable on mobile devices with offline capabilities
- **Role-Based Access Control**: Secure authentication for Admin, Teacher, and Parent/Student roles
- **Attendance Management**: Dual-session tracking (Morning/Afternoon) with duplicate prevention
- **Fee Tracking**: Monthly fee cycles with automated reminders and payment approvals
- **Study Notes**: Google Drive integration for seamless note sharing
- **Push Notifications**: Real-time FCM notifications for attendance and fee updates
- **Intelligent Caching**: IndexedDB-based offline data access with smart pruning
- **Responsive Design**: Optimized for mobile-first usage with dark mode support

## 🏗️ Architecture Overview

- **Backend**: Node.js + Express.js API with Supabase (PostgreSQL) database
- **Frontend**: React 19 + Vite PWA with Firebase Cloud Messaging
- **Security**: JWT authentication, Helmet security headers, CORS protection
- **Deployment**: Container-ready with environment-based configuration

## 📁 Project Structure

```
ADARSHA_PATHASALA/
├── backend/                          # Express.js API server
│   ├── .env.example                  # Backend environment template
│   ├── config/                       # Environment and service configurations
│   ├── controllers/                  # Business logic handlers
│   ├── middleware/                   # Authentication and error handling
│   ├── routes/                       # API endpoint definitions
│   ├── services/                     # Supabase, Firebase, and utility services
│   ├── database/schema.sql           # Database schema and migrations
│   └── server.js                     # Application entry point
├── frontend/                         # React PWA application
│   ├── .env.example                  # Frontend environment template
│   ├── public/                       # Static assets
│   ├── src/                          # React source code
│   ├── vite.config.js                # Vite build configuration
│   └── package.json                  # Frontend dependencies
├── .gitignore                        # Git ignore rules
├── DEPLOYMENT.md                     # Production deployment guide
├── SRS.md                            # Software Requirements Specification
├── package.json                      # Root package configuration
└── README.md                         # This file
```

##  Prerequisites

- **Node.js**: Version 16.0 or higher
- **Supabase Account**: Free tier sufficient for development
- **Firebase Project**: With Cloud Messaging (FCM) enabled

##  Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mr-simab/adarsha-pathasala.git
cd adarsha-pathasala
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Configure Environment Variables

Copy the example environment files and configure them:

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

**Required Backend Variables:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`

**Required Frontend Variables:**
- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.

### 4. Build and Run

```bash
# Build the frontend
npm run build

# Start the backend server
npm start
```

Access the application at `http://localhost:3000`.

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server in production mode |
| `npm run build` | Build the frontend for production |
| `npm run db:setup` | Initialize the database schema |
| `npm run check` | Validate backend syntax |
| `npm run audit` | Audit dependencies for vulnerabilities |

##  Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode (development/production) | Yes |
| `PORT` | Server port (default: 3000) | No |
| `APP_ORIGIN` | Frontend domain for CORS | Yes |
| `REQUIRE_AUTH` | Enable authentication | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `AUTO_CREATE_ADMIN` | Bootstrap admin account | No |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API URL | Yes |
| `VITE_FIREBASE_API_KEY` | Firebase API key | No* |
| `VITE_FIREBASE_VAPID_KEY` | FCM VAPID key | No* |

*Required for push notifications; app works without them.

##  Testing

### Health Check

Verify the backend is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "adarsha-pathasala",
  "supabase": "configured",
  "firebase": "configured"
}
```

### Build Verification

Ensure the frontend builds successfully:

```bash
npm run build
ls frontend/dist/
```

##  Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Production deployment instructions
- **[SRS](SRS.md)**: Software Requirements Specification
- **[API Documentation](backend/README.md)**: Backend API details

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Supabase](https://supabase.com/)
- Icons by [Heroicons](https://heroicons.com/)
- PWA features powered by [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

**Adarsha Pathasala Data Management System** © 2026. All rights reserved.
- `npm run build` — build the frontend
- `npm run db:setup` — initialize the database schema
- `npm run check` — validate backend entrypoint syntax
- `npm run audit` — audit dependencies

## Deployment

See `DEPLOYMENT.md` for production deployment steps.

