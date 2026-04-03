export default class BaseValidationStrategy {
  validate(_file) {
    throw new Error('validate(file) must be implemented');
  }
}
