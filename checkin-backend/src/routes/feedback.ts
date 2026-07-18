import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { Role } from '@prisma/client';

const router = Router();

// GET /feedback - Fetch feedback listings
router.get('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId, userRole, userId } = req;

  try {
    if (userRole === Role.CUSTOMER) {
      const feedback = await prisma.feedback.findMany({
        where: { guestId: userId },
        orderBy: { createdAt: 'desc' },
      });
      
      const mapped = feedback.map((f: any) => ({
        ...f,
        tags: f.tags ? f.tags.split(',') : [],
      }));

      return res.json(mapped);
    }

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context is missing.' });
    }

    const feedback = await prisma.feedback.findMany({
      include: {
        guest: { select: { fullName: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = feedback.map((f: any) => ({
      ...f,
      tags: f.tags ? f.tags.split(',') : [],
    }));

    return res.json(mapped);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /feedback - Guest submits feedback and preferences tags
router.post('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { userId } = req;
  const { rating, comments, tags } = req.body; // tags is an array of strings e.g. ["Extra pillows", "Needs ground floor"]

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating is required and must be between 1 and 5.' });
  }

  try {
    const serializedTags = tags && Array.isArray(tags) ? tags.join(',') : null;

    const feedback = await prisma.feedback.create({
      data: {
        guestId: userId!,
        rating: parseInt(rating),
        comments,
        tags: serializedTags,
      },
    });

    return res.json({
      message: 'Feedback submitted successfully.',
      feedback: {
        ...feedback,
        tags: feedback.tags ? feedback.tags.split(',') : [],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
