/**
 * File Upload Middleware
 */

import multer from 'multer';
import UploadMiddlewareFactory from '../factories/UploadMiddlewareFactory.js';

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

    // Factory produces multer middleware instances using strategies/config presets
    this.factory = new UploadMiddlewareFactory({
      storage: this.storage
    });
  }

  /**
   * Backwards-compatible API.
   * Creates a single-file upload middleware for the given field name.
   */
  upload(fieldName = 'image') {
    return this.factory
      .create({
        fieldName,
        preset: 'image'
      });
  }

  /**
   * New API: pick a preset (e.g. 'image', 'avatar', 'document')
   */
  uploadWithPreset(preset, fieldName = 'file') {
    return this.factory.create({ preset, fieldName });
  }
}

export default new FileUploadMiddleware();
