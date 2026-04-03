import BaseValidationStrategy from './BaseValidationStrategy.js';

export default class ImageValidationStrategy extends BaseValidationStrategy {
  constructor({ allowedTypes } = {}) {
    super();
    this.allowedTypes = allowedTypes ?? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  validate(file) {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG and WebP allowed');
    }
  }
}
