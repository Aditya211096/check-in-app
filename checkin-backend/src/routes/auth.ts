import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { Role } from '@prisma/client';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kashi_vishwanath_spiritual_dawn_secret_key_987654';

// Mock OTP verify handler (In production, replace with admin.auth().verifyIdToken() from Firebase)
const verifyOTP = async (phoneNumber: string, otpToken: string): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development' || otpToken === '123456') {
    return true; // Auto-bypass for development
  }
  
  // Real Firebase verification goes here
  return false;
};

// Log in / Sign up Guest or Staff
router.post('/login', async (req: Request, res: Response) => {
  const { phoneNumber, otpToken, fullName, tenantId } = req.body;

  if (!phoneNumber || !otpToken) {
    return res.status(400).json({ error: 'Phone number and OTP token are required.' });
  }

  try {
    const isValid = await verifyOTP(phoneNumber, otpToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    // Check if user exists globally
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { tenant: true },
    });

    // If user does not exist, create a new customer
    if (!user) {
      if (!fullName) {
        return res.status(400).json({
          error: 'User not found. Full name is required to complete registration.',
          isNewUser: true,
        });
      }

      user = await prisma.user.create({
        data: {
          phoneNumber,
          fullName,
          role: Role.CUSTOMER,
          tenantId: tenantId || null, // Optional tenant association at signup
        },
        include: { tenant: true },
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
        tenantId: user.tenantId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name || null,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin Setup Route (Initial bootstrapping)
router.post('/setup-admin', async (req: Request, res: Response) => {
  const { phoneNumber, fullName, secretKey, tenantName, address, contactNum } = req.body;

  // Simple protection for admin creation in dev/staging
  if (secretKey !== 'KASHI_BOOTSTRAP_2026') {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  try {
    // Create new Tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName || 'Varanasi Royal Ghats Resort',
        address: address || 'Dashashwamedh Ghat, Varanasi, UP',
        contactNum: contactNum || '+91-9876543210',
      },
    });

    // Create Manager user for Tenant
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        fullName,
        role: Role.MANAGER,
        tenantId: tenant.id,
        isVerified: true,
      },
    });

    return res.json({
      message: 'System bootstrapped successfully.',
      tenant,
      user,
    });
  } catch (err: any) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
