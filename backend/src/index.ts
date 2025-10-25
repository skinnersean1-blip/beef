import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { verifyToken } from './utils/jwt';

// Routes
import authRoutes from './routes/authRoutes';
import debateRoutes from './routes/debateRoutes';
import betRoutes from './routes/betRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/debates', debateRoutes);
app.use('/api', betRoutes);
app.use('/api', commentRoutes);

// Error handler
app.use(errorHandler);

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authentication
  socket.on('authenticate', (token: string) => {
    try {
      const user = verifyToken(token);
      socket.data.user = user;
      socket.emit('authenticated', { userId: user.userId });
    } catch (error) {
      socket.emit('auth_error', { message: 'Invalid token' });
    }
  });

  // Join debate room
  socket.on('join_debate', (debateId: string) => {
    socket.join(`debate:${debateId}`);
    console.log(`Socket ${socket.id} joined debate ${debateId}`);
  });

  // Leave debate room
  socket.on('leave_debate', (debateId: string) => {
    socket.leave(`debate:${debateId}`);
    console.log(`Socket ${socket.id} left debate ${debateId}`);
  });

  // New comment event
  socket.on('new_comment', (data: { debateId: string; comment: any }) => {
    io.to(`debate:${data.debateId}`).emit('comment_added', data.comment);
  });

  // Vote event
  socket.on('new_vote', (data: { debateId: string; vote: any }) => {
    io.to(`debate:${data.debateId}`).emit('vote_added', data.vote);
  });

  // Bet event
  socket.on('new_bet', (data: { debateId: string; bet: any }) => {
    io.to(`debate:${data.debateId}`).emit('bet_placed', data.bet);
  });

  // Typing indicator
  socket.on('typing', (data: { debateId: string; username: string }) => {
    socket.to(`debate:${data.debateId}`).emit('user_typing', data);
  });

  // Stop typing
  socket.on('stop_typing', (data: { debateId: string; username: string }) => {
    socket.to(`debate:${data.debateId}`).emit('user_stopped_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// Start server
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     🥊 Beef Server Running 🥊       ║
  ╠══════════════════════════════════════╣
  ║  Port: ${PORT}                        ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║  Socket.io: Enabled                  ║
  ╚══════════════════════════════════════╝
  `);
});

export default app;
