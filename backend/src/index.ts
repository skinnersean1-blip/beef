import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { authenticate } from './middleware/auth';
import * as authController from './controllers/authController';
import * as debateController from './controllers/debateController';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Beef API is running' });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Debate routes
app.get('/api/debates', authenticate, debateController.getDebates);
app.get('/api/debates/:id', authenticate, debateController.getDebate);
app.post('/api/debates', authenticate, debateController.createDebate);
app.post('/api/debates/:id/accept', authenticate, debateController.acceptDebate);
app.post('/api/debates/:id/finalize', authenticate, debateController.finalizeDebate);
app.post('/api/debates/:id/comments', authenticate, debateController.addComment);
app.post('/api/votes', authenticate, debateController.vote);
app.post('/api/bets', authenticate, debateController.placeBet);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_debate', (debateId: string) => {
    socket.join(`debate:${debateId}`);
    console.log(`User ${socket.id} joined debate ${debateId}`);
  });

  socket.on('leave_debate', (debateId: string) => {
    socket.leave(`debate:${debateId}`);
    console.log(`User ${socket.id} left debate ${debateId}`);
  });

  socket.on('new_comment', (data) => {
    io.to(`debate:${data.debateId}`).emit('comment_added', data.comment);
  });

  socket.on('new_vote', (data) => {
    io.to(`debate:${data.debateId}`).emit('vote_added', data.vote);
  });

  socket.on('new_bet', (data) => {
    io.to(`debate:${data.debateId}`).emit('bet_added', data.bet);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🔥 Beef API running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});
