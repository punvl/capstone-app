# Badminton Training System - Frontend

React + TypeScript frontend for the Badminton Training System with real-time shot tracking and court visualization.

## Features

- 🔐 User Authentication (JWT)
- 👥 Athlete Management (CRUD)
- 🏸 Real-time Training Control with Live Court Visualization
- 📊 Performance Dashboard with Analytics
- 📈 Session Details with Shot-by-Shot Analysis
- 🔌 WebSocket Integration for Real-time Updates
- 📱 Responsive Material-UI Design

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see ../badminton-backend)

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL if different
```

## Running the Application

```bash
# Development mode
npm start

# Production build
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Navigation.tsx
│   ├── ProtectedRoute.tsx
│   ├── TrainingControl.tsx
│   ├── CourtVisualization.tsx
│   ├── AthleteManagement.tsx
│   ├── PerformanceDashboard.tsx
│   └── SessionDetail.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── TrainingContext.tsx
├── utils/              # Utility functions
│   └── api.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## Key Components

### Authentication
- **Login**: User login with email/password
- **Register**: New user registration with password strength indicator
- **ProtectedRoute**: Guards routes requiring authentication

### Training
- **TrainingControl**: Start/stop training sessions, athlete selection
- **CourtVisualization**: SVG badminton court with real-time shot tracking
  - Live mode: Shows current shot with animation
  - Review mode: Shows all shots from a session

### Performance
- **PerformanceDashboard**: View training history and statistics
- **SessionDetail**: Detailed session view with all shots on court

### Athlete Management
- **AthleteManagement**: CRUD operations for athletes

## Features in Detail

### Real-time Shot Tracking
- WebSocket connection to backend
- Live court visualization with shot accuracy
- Color-coded accuracy indicators (green < 20cm, orange 20-50cm, red > 50cm)
- Animated current shot display

### Court Visualization
- Standard badminton court dimensions (13.4m × 6.1m)
- Accurate court lines and zones
- Target and landing position markers
- Accuracy lines connecting target to landing

### Performance Analytics
- Session history with filtering
- Aggregate statistics (total shots, accuracy, velocity)
- Clickable rows to view session details
- Rating system for sessions

## API Integration

The frontend connects to the backend API:

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/athletes` - List athletes
- `POST /api/sessions/start` - Start training
- `POST /api/sessions/:id/stop` - Stop training
- `GET /api/sessions/:id` - Get session details

## WebSocket Events

- `join_session` - Join session for real-time updates
- `shot_received` - Receive shot data from backend
- `session_stats_updated` - Receive updated statistics
- `session_ended` - Session ended notification

## Styling

- Material-UI v7 components
- Custom theme with primary (#1976d2) and secondary (#dc004e) colors
- Responsive design for mobile and desktop
- Clean, modern interface

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Production Deployment

1. Update `.env` with production API URL
2. Build the application: `npm run build`
3. Deploy the `build` folder to your hosting service (Netlify, Vercel, AWS S3, etc.)
4. Ensure CORS is configured on the backend to allow your frontend domain

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on http://localhost:5000
- Check REACT_APP_API_URL in .env
- Verify CORS settings in backend

### WebSocket not connecting
- Check REACT_APP_SOCKET_URL in .env
- Ensure Socket.IO is properly initialized on backend
- Check browser console for errors

### Court visualization not showing
- Ensure shot data includes x, y coordinates
- Check that coordinates are within court bounds (0-13.4m, 0-6.1m)
- Verify SVG is rendering correctly in browser

## License

MIT
