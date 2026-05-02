import 'reflect-metadata';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import athleteRoutes from './routes/athlete.routes';
import sessionRoutes from './routes/session.routes';
import templateRoutes from './routes/template.routes';

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Badminton Training API is running' });
});

// Latency CSV download (only available when LATENCY_LOG=true)
app.get('/api/debug/latency-csv', (_req, res) => {
  const csvPath = process.env.LATENCY_LOG_PATH || '/tmp/backend_latency.csv';
  if (process.env.LATENCY_LOG !== 'true' && process.env.LATENCY_LOG !== '1') {
    return res.status(404).json({ error: 'Latency logging is not enabled' });
  }
  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: 'No latency CSV found — no shots logged yet' });
  }
  res.download(csvPath, 'backend_latency.csv');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/templates', templateRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;

