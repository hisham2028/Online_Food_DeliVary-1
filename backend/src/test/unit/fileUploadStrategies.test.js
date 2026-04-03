/**
 * UNIT TEST — File Upload Validation Strategies
 * Tests: BaseValidationStrategy, ImageValidationStrategy,
 *        AvatarValidationStrategy, DocumentValidationStrategy
 */
import { describe, test, expect } from 'vitest';
import BaseValidationStrategy from '../../strategies/fileUpload/BaseValidationStrategy.js';
import ImageValidationStrategy from '../../strategies/fileUpload/ImageValidationStrategy.js';
import AvatarValidationStrategy from '../../strategies/fileUpload/AvatarValidationStrategy.js';
import DocumentValidationStrategy from '../../strategies/fileUpload/DocumentValidationStrategy.js';

describe('BaseValidationStrategy', () => {
  test('throws error when validate() is called directly', () => {
    const base = new BaseValidationStrategy();
    expect(() => base.validate({})).toThrow('validate(file) must be implemented');
  });
});

describe('ImageValidationStrategy', () => {
  const strategy = new ImageValidationStrategy();

  test('accepts JPEG files', () => {
    expect(() => strategy.validate({ mimetype: 'image/jpeg' })).not.toThrow();
  });

  test('accepts PNG files', () => {
    expect(() => strategy.validate({ mimetype: 'image/png' })).not.toThrow();
  });

  test('accepts WebP files', () => {
    expect(() => strategy.validate({ mimetype: 'image/webp' })).not.toThrow();
  });

  test('rejects PDF files', () => {
    expect(() => strategy.validate({ mimetype: 'application/pdf' })).toThrow();
  });

  test('rejects GIF files', () => {
    expect(() => strategy.validate({ mimetype: 'image/gif' })).toThrow();
  });

  test('accepts custom allowedTypes via constructor', () => {
    const custom = new ImageValidationStrategy({ allowedTypes: ['image/gif'] });
    expect(() => custom.validate({ mimetype: 'image/gif' })).not.toThrow();
    expect(() => custom.validate({ mimetype: 'image/png' })).toThrow();
  });
});

describe('AvatarValidationStrategy', () => {
  const strategy = new AvatarValidationStrategy();

  test('inherits image validation — accepts JPEG', () => {
    expect(() => strategy.validate({ mimetype: 'image/jpeg' })).not.toThrow();
  });

  test('inherits image validation — rejects PDF', () => {
    expect(() => strategy.validate({ mimetype: 'application/pdf' })).toThrow();
  });

  test('is an instance of ImageValidationStrategy', () => {
    expect(strategy).toBeInstanceOf(ImageValidationStrategy);
  });

  test('is an instance of BaseValidationStrategy', () => {
    expect(strategy).toBeInstanceOf(BaseValidationStrategy);
  });
});

describe('DocumentValidationStrategy', () => {
  const strategy = new DocumentValidationStrategy();

  test('accepts PDF files', () => {
    expect(() => strategy.validate({ mimetype: 'application/pdf' })).not.toThrow();
  });

  test('rejects image files', () => {
    expect(() => strategy.validate({ mimetype: 'image/jpeg' })).toThrow();
  });

  test('rejects text files', () => {
    expect(() => strategy.validate({ mimetype: 'text/plain' })).toThrow();
  });

  test('is an instance of BaseValidationStrategy', () => {
    expect(strategy).toBeInstanceOf(BaseValidationStrategy);
  });
});
