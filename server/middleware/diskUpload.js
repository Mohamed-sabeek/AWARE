import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname) || '.jpg';
    if (!ext || ext === '.') ext = '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/octet-stream' || 
    file.originalname.match(/\.(jpg|jpeg|png)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG/PNG) are allowed!'), false);
  }
};

const diskUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default diskUpload;
