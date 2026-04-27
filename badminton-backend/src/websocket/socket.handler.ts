import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

class SocketHandler {
  private io: Server | null = null;

  initialize(server: HTTPServer) {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
    this.io = new Server(server, {
      cors: {
        origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);

      socket.on('join_session', (sessionId: string) => {
        socket.join(`session_${sessionId}`);
        console.log(`[SOCKET] Client ${socket.id} joined session ${sessionId}`);
      });

      socket.on('leave_session', (sessionId: string) => {
        socket.leave(`session_${sessionId}`);
        console.log(`[SOCKET] Client ${socket.id} left session ${sessionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });

    console.log('✅ WebSocket initialized');
  }

  // shotData is the persisted Shot entity augmented with pipeline latency
  // timestamps (frameCapturedAt, shotDetectedAt, cvPublishedAt,
  // brokerReceivedAt, brokerEmittedAt). The frontend reads these to log
  // end-to-end latency when REACT_APP_LATENCY_LOG is enabled.
  emitShotData(sessionId: string, shotData: Record<string, unknown>) {
    if (!this.io) return;
    this.io.to(`session_${sessionId}`).emit('shot_received', shotData);
  }

  emitSessionStats(sessionId: string, stats: any) {
    if (!this.io) return;
    this.io.to(`session_${sessionId}`).emit('session_stats_updated', stats);
  }

  emitSessionEnded(sessionId: string) {
    if (!this.io) return;
    this.io.to(`session_${sessionId}`).emit('session_ended');
  }
}

export const socketHandler = new SocketHandler();

