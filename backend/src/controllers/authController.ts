import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, displayName, referralCode, tosAccepted } = req.body;

    // Validate input
    if (!email || !username || !password || !displayName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate ToS acceptance
    if (!tosAccepted) {
      return res.status(400).json({ error: 'You must accept the Terms of Service' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Check referral code if provided
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrer) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with referral bonus
    const baseBonus = 100;
    const referralBonus = referrer ? 25 : 0; // Extra $25 if referred

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName,
        walletBalance: baseBonus + referralBonus,
        referredById: referrer?.id,
        tosAccepted: true,
        tosAcceptedAt: new Date(),
      },
    });

    // Award referrer bonus
    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          walletBalance: {
            increment: 50, // Referrer gets $50
          },
        },
      });

      // Create transaction records
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: referralBonus,
          type: 'DEPOSIT',
          description: `Referral bonus from ${referrer.username}`,
        },
      });

      await prisma.transaction.create({
        data: {
          userId: referrer.id,
          amount: 50,
          type: 'DEPOSIT',
          description: `Referral reward for inviting ${username}`,
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getReferralStats = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            username: true,
            displayName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalEarned = user.referrals.length * 50; // $50 per referral

    res.json({
      referralCode: user.referralCode,
      totalReferrals: user.referrals.length,
      totalEarned,
      referrals: user.referrals,
      inviteUrl: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({ error: 'Failed to get referral stats' });
  }
};
