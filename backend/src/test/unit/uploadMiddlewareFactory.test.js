/**
 * UNIT TEST — UploadMiddlewareFactory
 * Tests: Factory creates correct middleware with strategies and limits
 */
import { describe, test, expect, vi } from 'vitest';
import UploadMiddlewareFactory from '../../factories/UploadMiddlewareFactory.js';

// Create a mock storage object
const mockStorage = {
  _handleFile: vi.fn(),
  _removeFile: vi.fn(),
};

describe('UploadMiddlewareFactory', () => {
  test('constructor throws if storage is not provided', () => {
    expect(() => new UploadMiddlewareFactory({})).toThrow('requires a multer storage instance');
  });

  test('constructor succeeds with valid storage', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(factory).toBeDefined();
    expect(factory.presets).toBeDefined();
  });

  test('has image, avatar, and document presets', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(factory.presets.image).toBeDefined();
    expect(factory.presets.avatar).toBeDefined();
    expect(factory.presets.document).toBeDefined();
  });

  test('image preset has 5MB file size limit', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(factory.presets.image.limits.fileSize).toBe(5 * 1024 * 1024);
  });

  test('avatar preset has 2MB file size limit', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(factory.presets.avatar.limits.fileSize).toBe(2 * 1024 * 1024);
  });

  test('document preset has 10MB file size limit', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(factory.presets.document.limits.fileSize).toBe(10 * 1024 * 1024);
  });

  test('create() returns a function (multer middleware)', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    const middleware = factory.create({ preset: 'image', fieldName: 'image' });
    expect(typeof middleware).toBe('function');
  });

  test('create() throws for unknown preset without custom strategy', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    expect(() => factory.create({ preset: 'video' })).toThrow('Unknown upload preset: video');
  });

  test('create() accepts a custom strategy override', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    const customStrategy = { validate: vi.fn() };
    const middleware = factory.create({ preset: 'image', strategy: customStrategy });
    expect(typeof middleware).toBe('function');
  });

  test('create() defaults to image preset when no preset specified', () => {
    const factory = new UploadMiddlewareFactory({ storage: mockStorage });
    const middleware = factory.create({});
    expect(typeof middleware).toBe('function');
  });
});
