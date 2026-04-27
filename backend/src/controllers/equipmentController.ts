import { Request, Response } from 'express';
import Equipment from '../models/Equipment';
import fs from 'fs';
import path from 'path';

// Helper function to get full image URL
const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath || imagePath === '') {
    return '';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // For local images, return the full URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.API_URL || process.env.FRONTEND_URL
    : 'http://localhost:5000';
  return `${baseUrl}${imagePath}`;
};

export const getAllEquipment = async (req: Request, res: Response) => {
  try {
    const equipment = await Equipment.find().sort({ category: 1, name: 1 });
    // Transform the response to include full image URLs
    const transformedEquipment = equipment.map(item => ({
      ...item.toObject(),
      image: getFullImageUrl(item.image)
    }));
    res.json({ success: true, data: transformedEquipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment', error });
  }
};

export const addEquipment = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      // Store relative path without domain
      imageUrl = `/uploads/${req.file.filename}`;
      console.log(`✅ Image saved: ${imageUrl}`);
    }
    
    const equipment = await Equipment.create({ 
      name, 
      image: imageUrl,
      category: category || 'Uncategorized'
    });
    
    // Return with full URL
    const responseEquipment = {
      ...equipment.toObject(),
      image: getFullImageUrl(equipment.image)
    };
    
    res.status(201).json({ 
      success: true, 
      data: responseEquipment, 
      message: 'Equipment added successfully' 
    });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({ message: 'Error adding equipment', error });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    
    const existingEquipment = await Equipment.findById(id);
    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    let imageUrl = existingEquipment.image;
    
    if (req.file) {
      // Delete old image if it exists and is not a placeholder
      if (existingEquipment.image && existingEquipment.image !== '' && !existingEquipment.image.includes('ui-avatars')) {
        const oldImagePath = path.join(__dirname, '../../public', existingEquipment.image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Old image deleted:', oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
      console.log(`✅ New image saved: ${imageUrl}`);
    }
    
    const equipment = await Equipment.findByIdAndUpdate(
      id, 
      { 
        name, 
        category: category || existingEquipment.category,
        image: imageUrl 
      }, 
      { new: true, runValidators: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Return with full URL
    const responseEquipment = {
      ...equipment.toObject(),
      image: getFullImageUrl(equipment.image)
    };
    
    res.json({ success: true, data: responseEquipment, message: 'Equipment updated successfully' });
  } catch (error: any) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ message: 'Error updating equipment', error: error.message });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    
    // Delete image file if it exists and is not a placeholder
    if (equipment.image && equipment.image !== '' && !equipment.image.includes('ui-avatars')) {
      const imagePath = path.join(__dirname, '../../public', equipment.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Image deleted:', imagePath);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    await Equipment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ message: 'Error deleting equipment', error });
  }
};

export const getEquipmentStats = async (req: Request, res: Response) => {
  try {
    const total = await Equipment.countDocuments();
    const categories = await Equipment.distinct('category');
    res.json({ success: true, data: { total, categories: categories.length, available: total, inUse: 0, underMaintenance: 0 } });
  } catch (error) {
    console.error('Error fetching equipment stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};