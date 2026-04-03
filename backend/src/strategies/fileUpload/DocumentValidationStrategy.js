import BaseValidationStrategy from './BaseValidationStrategy.js';

export default class DocumentValidationStrategy extends BaseValidationStrategy {
  constructor({ allowedTypes } = {}) {
    super();
    this.allowedTypes = allowedTypes ?? ['application/pdf'];
  }

  validate(file) {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF documents are allowed');
    }
  }
}
