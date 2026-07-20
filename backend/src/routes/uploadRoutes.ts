import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFileToR2 } from '../services/storageService';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', protect, authorize('superadmin'), upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    const imageUrl = await uploadFileToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Image upload failed', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

export default router;
