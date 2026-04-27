import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  adminId?: string;
  memberId?: string;
  userRole?: string;
  userType?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default_secret_key_change_this';
    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type === 'admin') {
      req.adminId = decoded.adminId;
      req.userRole = decoded.role;
      req.userType = 'admin';
    } else if (decoded.type === 'member') {
      req.memberId = decoded.memberId;
      req.userRole = 'MEMBER';
      req.userType = 'member';
    } else {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const requireMember = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userType !== 'member') {
    return res.status(403).json({ message: 'Member access required' });
  }
  next();
};