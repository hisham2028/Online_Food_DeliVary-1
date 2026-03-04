/**
 * File Upload Middleware
 */

import multer from 'multer';

class FileUploadMiddleware {
  constructor() {
    this.uploadDir = 'uploads';
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
      }
    });
  }

  upload(fieldName = 'image') {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG and WebP allowed'), false);
        }
      }
    }).single(fieldName);
  }
}

export default new FileUploadMiddleware();
