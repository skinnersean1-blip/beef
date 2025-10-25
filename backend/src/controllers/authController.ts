import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, password, displayName } = req.body;

      if (!email || !username || !password || !displayName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await authService.register({
        email,
        username,
        password,
        displayName,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login(email, password);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getProfile(userId);

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { displayName, bio, avatar } = req.body;

      const profile = await authService.updateProfile(userId, {
        displayName,
        bio,
        avatar,
      });

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  async getUserByUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const profile = await authService.getProfile(username);

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}
