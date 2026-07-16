import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_request, file, callback) {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      callback(null, true);
      return;
    }

    callback(new AppError('Only CSV files are allowed', 400));
  },
});

export const uploadCsv = upload.single('file');
