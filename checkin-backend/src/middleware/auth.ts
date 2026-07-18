import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TenantRequest } from './tenant';

const JWT_SECRET = process.env.JWT_SECRET || 'kashi_vishwanath_spiritual_dawn_secret_key_987654';

export interface DecodedToken {
  userId: string;
  phoneNumber: string;
  role: string;
  tenantId?: string;
}

export const authenticate = (req: TenantRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    // Overwrite or assert tenantId matches decoded token tenantId
    if (decoded.tenantId) {
      req.tenantId = decoded.tenantId;
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};
