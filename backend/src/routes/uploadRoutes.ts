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

// Health check endpoint to verify R2 config (no auth needed for diagnostics)
router.get('/check', (_req: Request, res: Response) => {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.R2_BUCKET_NAME || '';
  const publicUrl = process.env.R2_PUBLIC_URL || '';

  const configured = !!(accountId && accessKeyId && secretAccessKey && bucketName);
  
  res.json({
    r2_configured: configured,
    has_account_id: !!accountId,
    has_access_key: !!accessKeyId,
    has_secret_key: !!secretAccessKey,
    has_bucket_name: !!bucketName,
    has_public_url: !!publicUrl,
    bucket_name: bucketName || '(not set)',
    endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '(not set)',
  });
});

export default router;
