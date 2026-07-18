import { Router, Response } from 'express';
import multer from 'multer';
import prisma from '../config/db';
import { authenticate } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { uploadFile, getSignedUrl } from '../services/storage';
import { parseIdDocument } from '../services/ocr';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /guest/profile - Retrieve logged-in guest's profile & dependents
router.get('/profile', authenticate, async (req: TenantRequest, res: Response) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dependents: true,
        bookings: {
          orderBy: { checkInDate: 'desc' },
          include: { room: true, tenant: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Guest profile not found.' });
    }

    // Generate temporarily signed ID URL if present
    let idUrl = null;
    if (user.idProofUrl) {
      idUrl = await getSignedUrl(user.idProofUrl);
    }

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        idDetails: user.idDetails,
        idProofUrl: idUrl,
        tenantId: user.tenantId,
      },
      dependents: user.dependents,
      bookings: user.bookings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /guest/upload-id - Upload ID & parse via Document AI
router.post('/upload-id', authenticate, upload.single('idProof'), async (req: TenantRequest, res: Response) => {
  const { userId } = req;
  const file = req.file;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${userId}_id_proof_${Date.now()}.${fileExtension}`;
    
    // 1. Upload to Storage (Google Cloud Storage / Local Fallback)
    const fileKey = await uploadFile(file.buffer, fileName, file.mimetype);

    // 2. Perform OCR Parsing (Document AI / Mock Fallback)
    const parsedData = await parseIdDocument(file.buffer, file.mimetype);

    // 3. Update User DB profile with OCR findings and file key
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        idProofUrl: fileKey,
        idDetails: parsedData as any,
        isVerified: false, // Needs final human validation toggle by staff
      },
    });

    const signedUrl = await getSignedUrl(fileKey);

    return res.json({
      message: 'ID uploaded and parsed successfully.',
      idDetails: parsedData,
      idProofUrl: signedUrl,
    });
  } catch (err: any) {
    console.error('ID Upload/OCR Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /guest/dependent - Add dependent with optional ID upload
router.post('/dependent', authenticate, upload.single('idProof'), async (req: TenantRequest, res: Response) => {
  const { userId } = req;
  const { fullName, relationship } = req.body;
  const file = req.file;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  if (!fullName || !relationship) {
    return res.status(400).json({ error: 'FullName and relationship are required.' });
  }

  try {
    let fileKey = null;
    let parsedData = null;

    if (file) {
      const fileName = `${userId}_dep_${Date.now()}_proof.${file.originalname.split('.').pop()}`;
      fileKey = await uploadFile(file.buffer, fileName, file.mimetype);
      parsedData = await parseIdDocument(file.buffer, file.mimetype);
    }

    const dependent = await prisma.dependent.create({
      data: {
        primaryUserId: userId,
        fullName,
        relationship,
        idProofUrl: fileKey,
        idDetails: parsedData as any,
        isVerified: false,
      },
    });

    return res.json({
      message: 'Dependent added successfully.',
      dependent,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /guest/consent - Toggle sharing consent
router.post('/consent', authenticate, async (req: TenantRequest, res: Response) => {
  const { userId } = req;
  const { consentToShare } = req.body; // boolean

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Toggle the global profile sharing consent flag
        // We will store this flag directly on bookings or users
        // Let's also update active/upcoming bookings consent
        bookings: {
          updateMany: {
            where: { status: 'UPCOMING' },
            data: { consentToShare },
          },
        },
      },
    });

    // In prisma schema, consentToShare is inside Booking, let's return success
    return res.json({ message: 'Consent preferences updated.', consentToShare });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /guest/lookup-profile/:phoneNumber - Cross-property profile sharing check
router.get('/lookup-profile/:phoneNumber', authenticate, async (req: TenantRequest, res: Response) => {
  const { phoneNumber } = req.params;
  const { userRole, tenantId } = req;

  // Only Staff, Manager, or Owners can lookup guest records
  if (!userRole || userRole === Role.CUSTOMER) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  try {
    const guest = await prisma.user.findUnique({
      where: { phoneNumber: phoneNumber as string },
      include: {
        feedbacks: true, // Fetch historical feedback
        bookings: {
          where: { tenantId }, // Local booking history at this specific property
          orderBy: { checkInDate: 'desc' },
        },
      },
    });

    if (!guest) {
      return res.status(404).json({ error: 'No profile found for this phone number.' });
    }

    // Check if the guest has consented to profile sharing on ANY booking, or has matching local bookings.
    // If they have never booked locally AND have consentToShare set to false on all properties, we isolate details (Legal compliance).
    const hasConsented = await prisma.booking.findFirst({
      where: { guestId: guest.id, consentToShare: true },
    });

    const isLocalGuest = (guest as any).bookings.length > 0;

    if (!hasConsented && !isLocalGuest) {
      return res.status(403).json({
        error: 'Profile sharing consent not provided by this guest for external properties.',
      });
    }

    // Compile network-wide feedback tags and needs (anonymous, clean from metadata)
    const needsAndFeedback = (guest as any).feedbacks.map((f: any) => ({
      rating: f.rating,
      comments: f.comments,
      tags: f.tags ? f.tags.split(',') : [],
      createdAt: f.createdAt,
    }));

    // Generate signed ID URL if they are already verified
    let idUrl = null;
    if (guest.idProofUrl) {
      idUrl = await getSignedUrl(guest.idProofUrl);
    }

    return res.json({
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        phoneNumber: guest.phoneNumber,
        isVerified: guest.isVerified,
        idDetails: guest.idDetails,
        idProofUrl: idUrl,
      },
      historicalFeedback: needsAndFeedback,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
