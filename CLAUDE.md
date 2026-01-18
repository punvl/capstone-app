# CLAUDE.md - AI Assistant Context

## Project Overview

This is a **Badminton Training System** - a full-stack web application for real-time badminton shot tracking, performance analytics, and training session management.

**Status:** Production-ready, fully functional system

## Project Structure

```
capstone/
├── badminton-backend/          # Express.js + TypeScript backend
│   ├── src/
│   │   ├── models/             # TypeORM entities (User, Athlete, Session, Shot)
│   │   ├── services/           # Business logic layer
│   │   ├── controllers/        # API route handlers
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Auth & error handling
│   │   ├── config/             # Database, Redis, RabbitMQ config
│   │   ├── websocket/          # Socket.IO handler
│   │   └── utils/              # Helper functions
│   ├── scripts/                # Database initialization scripts
│   └── docker-compose.yml      # Multi-container setup
│
├── badminton-frontend/         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── TrainingControl.tsx
│   │   │   ├── CourtVisualization.tsx  # SVG court with shot tracking
│   │   │   ├── AthleteManagement.tsx
│   │   │   ├── PerformanceDashboard.tsx
│   │   │   └── SessionDetail.tsx
│   │   ├── context/            # AuthContext, TrainingContext
│   │   ├── utils/              # API utilities
│   │   └── types/              # TypeScript types
│   └── public/                 # Static assets
│
├── docs/                       # Documentation (all .md files)
├── deprecated/                 # Old project files
└── CLAUDE.md                   # This file
```

## Tech Stack

### Backend
- **Framework:** Express.js 4.x with TypeScript 5.x
- **Database:** PostgreSQL 14+ with TypeORM 0.3.x
- **Cache:** Redis 7.x for session management
- **Message Broker:** RabbitMQ 3.x for CV component integration
- **WebSocket:** Socket.IO 4.x for real-time updates
- **Auth:** JWT with Redis sessions
- **DevOps:** Docker & Docker Compose

### Frontend
- **Framework:** React 19 with TypeScript 4.9+
- **UI Library:** Material-UI (MUI) v7
- **Routing:** React Router v7
- **State:** Context API (AuthContext, TrainingContext)
- **WebSocket:** Socket.IO Client 4.x
- **Charts:** Chart.js 4.x (installed, ready for use)
- **Build Tool:** Create React App

## Key Features

### Implemented (100%)
- JWT authentication with Redis session storage
- User/Coach account management
- Athlete CRUD operations
- Training session lifecycle (start/stop/track)
- Real-time shot data tracking via WebSocket
- SVG-based court visualization (13.4m × 6.1m standard court)
- Shot accuracy calculation and color-coding
- Performance analytics dashboard
- Session history and detailed session views
- RabbitMQ integration for external CV component
- Docker Compose development environment

## Architecture

### System Flow
```
Frontend (React) ←→ Backend API (Express.js) ←→ PostgreSQL
         ↓                    ↓
    Socket.IO            RabbitMQ
         ↓                    ↓
    Live Updates        CV Component (External)
```

### Training Session Flow
1. Coach logs in → JWT token issued
2. Coach selects athlete and starts training
3. Backend publishes `session.start` to RabbitMQ → CV component starts
4. CV detects shot → publishes shot data to RabbitMQ
5. Backend receives shot → calculates accuracy → saves to DB → broadcasts via WebSocket
6. Frontend receives shot → updates court visualization in real-time
7. Coach stops session → Backend publishes `session.stop` → session saved

### Database Schema
- **users** - Coach accounts (id, email, password_hash, username)
- **athletes** - Athlete profiles (id, name, dob, gender, skill_level, dominant_hand, etc.)
- **training_sessions** - Session records (id, athlete_id, coach_id, start/end times, stats)
- **shots** - Individual shots (id, session_id, shot_number, positions, accuracy, velocity)
- **rallies** - Rally sequences (id, session_id, start/end times)
- **rally_events** - Rally event details (id, rally_id, event_type, timestamp)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register coach account
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Athletes
- `GET /api/athletes` - List all athletes
- `GET /api/athletes/:id` - Get athlete by ID
- `POST /api/athletes` - Create athlete
- `PUT /api/athletes/:id` - Update athlete
- `DELETE /api/athletes/:id` - Delete athlete

### Training Sessions
- `POST /api/sessions/start` - Start session (triggers CV via RabbitMQ)
- `POST /api/sessions/:id/stop` - Stop session
- `GET /api/sessions` - List sessions with pagination
- `GET /api/sessions/:id` - Get session with all shots

## Message Broker Events

### Published by Backend
- **Routing Key:** `session.start`
  - **Payload:** `{sessionId, athleteId, targetZone}`
  - **Consumer:** CV Component

- **Routing Key:** `session.stop`
  - **Payload:** `{sessionId, timestamp}`
  - **Consumer:** CV Component

### Consumed by Backend
- **Routing Key:** `shot.data.*`
  - **Payload:** `{sessionId, shotNumber, targetPosition, landingPosition, velocity, detectionConfidence}`
  - **Producer:** CV Component

## WebSocket Events

### Client → Server
- `join_session` - Join session room for updates
- `leave_session` - Leave session room

### Server → Client
- `shot_received` - New shot data from CV
- `session_stats_updated` - Updated session statistics
- `session_ended` - Session ended notification

## Development Setup

### Start Backend
```bash
cd badminton-backend
docker-compose up -d
# API: http://localhost:5000
# RabbitMQ UI: http://localhost:15672 (user: badminton, pass: badminton123)
```

### Start Frontend
```bash
cd badminton-frontend
npm start
# App: http://localhost:3000
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://badminton_user:badminton_pass@localhost:5432/badminton_training
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://badminton:badminton123@localhost:5672
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Code Conventions

### Backend
- **File Structure:** Models → Services → Controllers → Routes
- **Naming:** camelCase for variables/functions, PascalCase for classes/types
- **Error Handling:** Custom AppError class, centralized error middleware
- **Validation:** Input validation in controllers before service calls
- **Database:** TypeORM entities with decorators, automatic migrations in dev

### Frontend
- **File Structure:** Components in `/components`, context in `/context`, utils in `/utils`
- **Naming:** PascalCase for components, camelCase for functions/hooks
- **State Management:** Context API (AuthContext for auth, TrainingContext for training state + WebSocket)
- **API Calls:** Centralized in `/utils/api.ts` with error handling
- **Styling:** Material-UI `sx` prop for inline styles

## Important Notes for AI Assistants

### When Adding Features
1. **Backend:** Add model → service → controller → route, in that order
2. **Frontend:** Add type → component → integrate with context if needed
3. **Database changes:** Modify TypeORM entities, migrations auto-sync in dev
4. **API changes:** Update both backend route AND frontend API utility
5. **Real-time features:** Use WebSocket events, don't poll

### Testing
- **Backend:** Use curl or Postman to test API endpoints
- **Frontend:** Use browser DevTools console to check WebSocket events
- **RabbitMQ:** Use management UI at http://localhost:15672 to inspect messages
- **Database:** Use `docker exec -it badminton_postgres psql -U badminton_user -d badminton_training`

### Common Tasks
- **Add new athlete field:** Modify `Athlete` entity → update `AthleteManagement` component
- **Add new shot metric:** Modify `Shot` entity → update `CourtVisualization` component
- **Add new API endpoint:** Create in controller → register in routes → update API utility
- **Add new chart:** Use Chart.js in new component, data from backend API

### Court Visualization
- **Dimensions:** 13.4m × 6.1m (standard doubles court)
- **Coordinate System:** Origin at bottom-left (0,0), top-right (13.4, 6.1)
- **Rendering:** SVG with responsive viewBox
- **Accuracy Colors:** Green (<20cm), Orange (20-50cm), Red (>50cm)

### Performance Considerations
- **Database:** Indexes on foreign keys and frequently queried fields
- **WebSocket:** Use rooms to broadcast only to relevant clients
- **Frontend:** Memoize expensive computations in court visualization
- **Pagination:** Sessions API uses limit/offset pagination

## Future Enhancements (Not Yet Implemented)

### Next Priority
- Chart.js visualizations (line charts for accuracy trends, bar charts for shot counts)
- Shot heatmap overlay on court
- Session replay feature (animate shots in sequence)
- CSV/PDF export for reports

### Advanced Features
- Video recording integration (sync video with shot timestamps)
- Machine learning for performance predictions
- Mobile app (React Native)
- Multi-court support
- Tournament mode
- Social features (athlete comparisons, leaderboards)

## Troubleshooting

### Backend won't start
- Check if ports 5000, 5432, 6379, 5672 are available
- Run `docker-compose down` then `docker-compose up -d`

### Frontend can't connect
- Verify `.env` has correct REACT_APP_API_URL and REACT_APP_SOCKET_URL
- Check CORS settings in backend (should allow http://localhost:3000)

### WebSocket not working
- Open browser console and check for connection errors
- Verify Socket.IO client version matches server version
- Check backend logs: `docker-compose logs -f api`

### Database issues
- Reset: `docker-compose down -v && docker-compose up -d` (WARNING: deletes all data)
- Connect: `docker exec -it badminton_postgres psql -U badminton_user -d badminton_training`

## Documentation Files

All detailed documentation is in the `docs/` directory:
- `README.md` - Main project README
- `PROJECT_SUMMARY.md` - Comprehensive project summary
- `GETTING_STARTED.md` - Quick start guide
- `DEMO_GUIDE.md` - Demo walkthrough
- `MOCK_CV_SETUP.md` - Mock CV component setup
- `badminton-backend/README.md` - Backend-specific docs
- `badminton-frontend/README.md` - Frontend-specific docs

## Quick Reference

### Start Everything
```bash
# Terminal 1
cd badminton-backend && docker-compose up -d

# Terminal 2
cd badminton-frontend && npm start
```

### Check Health
```bash
curl http://localhost:5000/health
```

### View Logs
```bash
cd badminton-backend
docker-compose logs -f api
```

### Database Access
```bash
docker exec -it badminton_postgres psql -U badminton_user -d badminton_training
```

---

**Last Updated:** 2025-01-18
**Project Status:** Production-ready, fully functional
**Backend Status:** 100% Complete
**Frontend Status:** 100% Complete
