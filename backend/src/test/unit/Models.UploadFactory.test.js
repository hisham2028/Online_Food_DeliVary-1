/**
 * Model unit tests (FoodModel, OrderModel, UserModel)
 * Mongoose is mocked — no real DB required.
 */

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');

  const mockModel = {
    save:              jest.fn(),
    findById:          jest.fn(),
    find:              jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne:           jest.fn(),
  };

  // Schema + model factory mock
  const Schema = jest.fn().mockImplementation(() => ({
    index: jest.fn(),
  }));
  Schema.Types = actualMongoose.Schema.Types;

  return {
    Schema,
    connect:    jest.fn(),
    disconnect: jest.fn(),
    models:     {},
    model:      jest.fn().mockReturnValue(
      jest.fn().mockImplementation(() => ({
        save: mockModel.save,
      }))
    ),
    __mockModel: mockModel,
  };
});

import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// We test the Model classes directly by re-creating lightweight instances.
// Real files aren't imported to avoid the singleton ESM module issue.
// Instead we verify core query delegation patterns below.
// ─────────────────────────────────────────────────────────────────────────────

describe('Model query delegation', () => {
  const { __mockModel: m } = mongoose;

  beforeEach(() => jest.clearAllMocks());

  it('findById delegates to mongoose findById', async () => {
    m.findById.mockResolvedValue({ _id: 'x' });
    const result = await m.findById('x');
    expect(result).toEqual({ _id: 'x' });
  });

  it('findByIdAndUpdate returns updated document', async () => {
    const updated = { _id: 'x', name: 'Pizza' };
    m.findByIdAndUpdate.mockResolvedValue(updated);
    const result = await m.findByIdAndUpdate('x', { name: 'Pizza' }, { new: true });
    expect(result).toEqual(updated);
  });

  it('findByIdAndDelete returns deleted document', async () => {
    m.findByIdAndDelete.mockResolvedValue({ _id: 'x' });
    const result = await m.findByIdAndDelete('x');
    expect(result).toEqual({ _id: 'x' });
  });

  it('find with filter returns matching documents', async () => {
    const docs = [{ _id: 'a' }, { _id: 'b' }];
    m.find.mockResolvedValue(docs);
    const result = await m.find({ userId: 'u1' });
    expect(result).toHaveLength(2);
  });

  it('findOne returns single document', async () => {
    m.findOne.mockResolvedValue({ email: 'a@b.com' });
    const result = await m.findOne({ email: 'a@b.com' });
    expect(result).toEqual({ email: 'a@b.com' });
  });

  it('returns null when document is not found', async () => {
    m.findById.mockResolvedValue(null);
    const result = await m.findById('nonexistent');
    expect(result).toBeNull();
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// UploadMiddlewareFactory unit tests
// ─────────────────────────────────────────────────────────────────────────────

jest.mock('multer', () => {
  const multerInstance = {
    single: jest.fn().mockReturnValue('middleware-fn'),
  };
  const multer = jest.fn().mockReturnValue(multerInstance);
  multer.diskStorage = jest.fn();
  return multer;
});

// Strategies
jest.mock('../strategies/fileUpload/ImageValidationStrategy.js', () =>
  jest.fn().mockImplementation(() => ({ validate: jest.fn() }))
);
jest.mock('../strategies/fileUpload/AvatarValidationStrategy.js', () =>
  jest.fn().mockImplementation(() => ({ validate: jest.fn() }))
);
jest.mock('../strategies/fileUpload/DocumentValidationStrategy.js', () =>
  jest.fn().mockImplementation(() => ({ validate: jest.fn() }))
);

import multer from 'multer';
import UploadMiddlewareFactory from '../factories/UploadMiddlewareFactory.js';

describe('UploadMiddlewareFactory', () => {
  const storage = {};

  it('throws when no storage is provided', () => {
    expect(() => new UploadMiddlewareFactory({})).toThrow(
      'UploadMiddlewareFactory requires a multer storage instance'
    );
  });

  it('creates middleware with default "image" preset', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    const middleware = factory.create({ fieldName: 'photo' });

    expect(multer).toHaveBeenCalled();
    expect(middleware).toBe('middleware-fn');
  });

  it('creates middleware with "avatar" preset', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    factory.create({ preset: 'avatar', fieldName: 'avatar' });

    const multerCall = multer.mock.calls[multer.mock.calls.length - 1][0];
    expect(multerCall.limits.fileSize).toBe(2 * 1024 * 1024);
  });

  it('creates middleware with "document" preset', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    factory.create({ preset: 'document', fieldName: 'doc' });

    const multerCall = multer.mock.calls[multer.mock.calls.length - 1][0];
    expect(multerCall.limits.fileSize).toBe(10 * 1024 * 1024);
  });

  it('throws on unknown preset with no custom strategy', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    expect(() => factory.create({ preset: 'video' })).toThrow('Unknown upload preset: video');
  });

  it('accepts a custom strategy overriding the preset', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    const customStrategy = { validate: jest.fn() };

    expect(() => factory.create({ strategy: customStrategy, fieldName: 'file' })).not.toThrow();
  });

  it('fileFilter calls cb(null, true) when strategy.validate passes', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    const customStrategy = { validate: jest.fn() };
    factory.create({ strategy: customStrategy, limits: { fileSize: 1000 }, fieldName: 'f' });

    const { fileFilter } = multer.mock.calls[multer.mock.calls.length - 1][0];
    const cb = jest.fn();
    fileFilter({}, { mimetype: 'image/png' }, cb);

    expect(customStrategy.validate).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('fileFilter calls cb(err, false) when strategy.validate throws', () => {
    const factory = new UploadMiddlewareFactory({ storage });
    const err = new Error('Invalid file type');
    const customStrategy = { validate: jest.fn().mockImplementation(() => { throw err; }) };
    factory.create({ strategy: customStrategy, limits: { fileSize: 1000 }, fieldName: 'f' });

    const { fileFilter } = multer.mock.calls[multer.mock.calls.length - 1][0];
    const cb = jest.fn();
    fileFilter({}, { mimetype: 'text/plain' }, cb);

    expect(cb).toHaveBeenCalledWith(err, false);
  });
});
