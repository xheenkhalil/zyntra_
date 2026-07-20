import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// R2 requires you to use the S3 client but pointed at Cloudflare
// R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME should be in .env
const accountId = process.env.R2_ACCOUNT_ID || '';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || '';
const publicUrl = process.env.R2_PUBLIC_URL || ''; // E.g., https://pub-xxxx.r2.dev

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const uploadFileToR2 = async (fileBuffer: Buffer, originalName: string, mimeType: string): Promise<string> => {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2 credentials are not fully configured in the environment.');
  }

  const ext = path.extname(originalName);
  const fileName = `${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  if (publicUrl) {
    return `${publicUrl}/${fileName}`;
  }
  
  // Fallback, though usually R2 images should be public or you'd use a custom domain
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${fileName}`;
};
