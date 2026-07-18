import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

const bucketName = process.env.GCS_BUCKET_NAME;
const projectId = process.env.GCP_PROJECT_ID;

let storage: Storage | null = null;

// Initialize GCS client only if credentials/config are provided
if (bucketName && projectId) {
  try {
    storage = new Storage({ projectId });
  } catch (err) {
    console.warn('GCP Storage failed to initialize. Falling back to local file storage.', err);
  }
}

const LOCAL_UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure local directory exists for fallback
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> => {
  if (storage && bucketName) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.save(fileBuffer, {
      metadata: { contentType: mimeType },
      resumable: false,
    });

    return fileName; // GCS File Key
  } else {
    // Local fallback
    const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);
    return `local_${fileName}`; // Local file key
  }
};

export const getSignedUrl = async (fileKey: string): Promise<string> => {
  if (storage && bucketName && !fileKey.startsWith('local_')) {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileKey);

    // Generate signed URL expiring in 15 minutes
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 mins
    });

    return url;
  } else {
    // Local fallback URL served by Express
    const cleanKey = fileKey.replace('local_', '');
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${serverUrl}/uploads/${cleanKey}`;
  }
};
