import ImageValidationStrategy from './ImageValidationStrategy.js';

export default class AvatarValidationStrategy extends ImageValidationStrategy {
  constructor() {
    super({ allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] });
  }
}
