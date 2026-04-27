import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getAllEquipment,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentStats
} from '../controllers/equipmentController';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 4 * 1024 * 1024 // 4 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
});

// Member and Admin can view equipment
router.get('/', authenticate, getAllEquipment);
router.get('/stats', authenticate, requireAdmin, getEquipmentStats);

// Admin only routes with file upload
router.post('/', authenticate, requireAdmin, upload.single('image'), addEquipment);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateEquipment);
router.delete('/:id', authenticate, requireAdmin, deleteEquipment);

export default router;