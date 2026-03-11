import multer from 'multer';
import ImageValidationStrategy from '../strategies/fileUpload/ImageValidationStrategy.js';
import AvatarValidationStrategy from '../strategies/fileUpload/AvatarValidationStrategy.js';
import DocumentValidationStrategy from '../strategies/fileUpload/DocumentValidationStrategy.js';

/**
 * Factory: creates multer middleware functions with preset configuration.
 */
export default class UploadMiddlewareFactory {
  constructor({ storage }) {
    if (!storage) throw new Error('UploadMiddlewareFactory requires a multer storage instance');
    this.storage = storage;

    // Presets map to a Strategy + limits.
    this.presets = {
      image: {
        strategy: new ImageValidationStrategy(),
        limits: { fileSize: 5 * 1024 * 1024 }
      },
      avatar: {
        strategy: new AvatarValidationStrategy(),
        limits: { fileSize: 2 * 1024 * 1024 }
      },
      document: {
        strategy: new DocumentValidationStrategy(),
        limits: { fileSize: 10 * 1024 * 1024 }
      }
    };
  }

  /**
   * Create a single-file upload middleware.
   * @param {{preset?: string, fieldName?: string, strategy?: any, limits?: any}} options
   */
  create(options = {}) {
    const { preset = 'image', fieldName = 'file', strategy, limits } = options;

    const presetConfig = this.presets[preset];
    if (!presetConfig && !strategy) {
      throw new Error(`Unknown upload preset: ${preset}`);
    }

    const usedStrategy = strategy ?? presetConfig.strategy;
    const usedLimits = limits ?? presetConfig.limits;

    return multer({
      storage: this.storage,
      limits: usedLimits,
      fileFilter: (req, file, cb) => {
        try {
          usedStrategy.validate(file);
          cb(null, true);
        } catch (err) {
          cb(err, false);
        }
      }
    }).single(fieldName);
  }
}
