import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate } from './middleware/auth';
import * as authController from './controllers/authController';
import * as beefController from './controllers/beefController';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Beef v2 API is running' });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Beef routes
app.get('/api/beefs', authenticate, beefController.getBeefs);
app.get('/api/beefs/:id', authenticate, beefController.getBeef);
app.post('/api/beefs', authenticate, beefController.createBeef);
app.post('/api/beefs/:id/accept', authenticate, beefController.acceptBeef);
app.post('/api/beefs/:id/posts', authenticate, beefController.addPost);
app.post('/api/beefs/:id/withdraw', authenticate, beefController.withdrawBeef);
app.post('/api/beefs/:id/concede', authenticate, beefController.concede);
app.post('/api/beefs/:id/like', authenticate, beefController.toggleLike);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Beef v2 API running on port ${PORT}`);
});
