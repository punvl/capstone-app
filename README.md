# Badminton Training System

A comprehensive badminton training system with real-time shot tracking, performance analytics, and court visualization.

## Quick Links

- **[CLAUDE.md](CLAUDE.md)** - AI Assistant context and project overview
- **[Documentation](docs/)** - All detailed documentation

## Quick Start

### Start Backend
```bash
cd badminton-backend
docker-compose up -d
```

### Start Frontend
```bash
cd badminton-frontend
npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- RabbitMQ UI: http://localhost:15672

## Documentation

- [README.md](docs/README.md) - Full project documentation
- [GETTING_STARTED.md](docs/GETTING_STARTED.md) - Setup guide
- [PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) - Complete project summary
- [DEMO_GUIDE.md](docs/DEMO_GUIDE.md) - Demo walkthrough
- [MOCK_CV_SETUP.md](docs/MOCK_CV_SETUP.md) - Mock CV component setup
- [BACKEND_README.md](docs/BACKEND_README.md) - Backend documentation
- [FRONTEND_README.md](docs/FRONTEND_README.md) - Frontend documentation

## Project Structure

```
capstone/
├── badminton-backend/          # Express.js + TypeScript backend
├── badminton-frontend/         # React + TypeScript frontend
├── docs/                       # Documentation
├── deprecated/                 # Old project files
├── CLAUDE.md                   # AI assistant context
└── README.md                   # This file
```

## Tech Stack

**Backend:** Express.js, TypeScript, PostgreSQL, Redis, RabbitMQ, Socket.IO, Docker

**Frontend:** React, TypeScript, Material-UI, React Router, Socket.IO Client

## Status

✅ Backend: 100% Complete
✅ Frontend: 100% Complete
✅ Production Ready
