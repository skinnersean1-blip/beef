import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new AppError('Email or username already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with initial wallet balance
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        displayName: data.displayName,
        walletBalance: 100, // Starting balance for new users
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    // Create initial transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT',
        amount: 100,
        balance: 100,
        description: 'Welcome bonus',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
        walletBalance: true,
        createdAt: true,
        _count: {
          select: {
            debatesCreated: true,
            debatesAccepted: true,
            betsPlaced: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; bio?: string; avatar?: string }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatar: true,
      },
    });

    return user;
  }
}
