import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  
  // MongoDB duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return res.status(409).json({ 
      message: `Duplicate entry: ${field} already exists` 
    });
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: err.message,
      errors: (err as any).errors 
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Multer error
  if (err.name === 'MulterError') {
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  res.status(500).json({ message: 'Internal server error' });
};