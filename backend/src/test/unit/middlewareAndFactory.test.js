/**
 * UploadMiddlewareFactory + FileUploadMiddleware unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock multer ─────────────────────────────────────────────────────────────
const mockSingle = vi.fn().mockReturnValue(vi.fn()); // multer().single('field')
const mockMulterInstance = { single: mockSingle };
const mockDiskStorage = vi.fn().mockReturnValue('disk-storage-obj');

vi.mock('multer', () => ({
  default: Object.assign(
    vi.fn().mockReturnValue(mockMulterInstance),
    { diskStorage: mockDiskStorage }
  ),
}));

const multer = (await import('multer')).default;

// ─── UploadMiddlewareFactory ─────────────────────────────────────────────────
const { default: UploadMiddlewareFactory } = await import('../../factories/UploadMiddlewareFactory.js');

describe('UploadMiddlewareFactory', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when constructed without a storage option', () => {
    expect(() => new UploadMiddlewareFactory({})).toThrow(
      'UploadMiddlewareFactory requires a multer storage instance'
    );
  });

  it('constructs successfully with a storage option', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    expect(factory.storage).toBe('mock-storage');
  });

  it('has default presets: image, avatar, document', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    expect(factory.presets).toHaveProperty('image');
    expect(factory.presets).toHaveProperty('avatar');
    expect(factory.presets).toHaveProperty('document');
  });

  it('create() returns a multer middleware for the image preset', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    const middleware = factory.create({ preset: 'image', fieldName: 'photo' });
    expect(multer).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalledWith('photo');
    expect(typeof middleware).toBe('function');
  });

  it('create() defaults to image preset and "file" field name', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create();
    expect(mockSingle).toHaveBeenCalledWith('file');
  });

  it('create() uses the avatar preset', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create({ preset: 'avatar', fieldName: 'avatar' });
    expect(mockSingle).toHaveBeenCalledWith('avatar');
  });

  it('create() uses the document preset', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create({ preset: 'document', fieldName: 'doc' });
    expect(mockSingle).toHaveBeenCalledWith('doc');
  });

  it('create() throws for an unknown preset when no custom strategy supplied', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    expect(() => factory.create({ preset: 'unknown' })).toThrow('Unknown upload preset: unknown');
  });

  it('create() accepts a custom strategy overriding the preset', () => {
    const customStrategy = { validate: vi.fn() };
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create({ strategy: customStrategy, fieldName: 'custom' });
    expect(mockSingle).toHaveBeenCalledWith('custom');
  });

  it('fileFilter calls cb(null, true) for a valid file', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create({ preset: 'image' });

    // Capture the fileFilter function passed to multer
    const multerOptions = multer.mock.lastCall[0];
    const fileFilter = multerOptions.fileFilter;

    const mockValidate = vi.spyOn(factory.presets.image.strategy, 'validate').mockImplementation(() => {});
    const cb = vi.fn();
    fileFilter({}, { mimetype: 'image/jpeg' }, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
    mockValidate.mockRestore();
  });

  it('fileFilter calls cb(err, false) when strategy throws', () => {
    const factory = new UploadMiddlewareFactory({ storage: 'mock-storage' });
    factory.create({ preset: 'image' });

    const multerOptions = multer.mock.lastCall[0];
    const fileFilter = multerOptions.fileFilter;

    vi.spyOn(factory.presets.image.strategy, 'validate').mockImplementation(() => {
      throw new Error('Invalid type');
    });
    const cb = vi.fn();
    fileFilter({}, { mimetype: 'application/pdf' }, cb);

    expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
  });
});

// ─── FileUploadMiddleware ─────────────────────────────────────────────────────
const { default: FileUploadMiddleware } = await import('../../middleware/FileUploadMiddleware.js');

// diskStorage is called once in the FileUploadMiddleware constructor at import time.
// Capture the config before any beforeEach can clear mock call history.
const _diskStorageConfig = mockDiskStorage.mock.calls[0]?.[0];

describe('FileUploadMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upload() returns a multer single-file middleware', () => {
    const middleware = FileUploadMiddleware.upload('image');
    expect(multer).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalledWith('image');
    expect(typeof middleware).toBe('function');
  });

  it('upload() uses "image" as the default field name', () => {
    FileUploadMiddleware.upload();
    expect(mockSingle).toHaveBeenCalledWith('image');
  });

  it('storage uses diskStorage', () => {
    expect(_diskStorageConfig).toBeDefined();
  });

  it('destination callback writes to the uploadDir', () => {
    const cb = vi.fn();
    _diskStorageConfig.destination({}, {}, cb);
    expect(cb).toHaveBeenCalledWith(null, FileUploadMiddleware.uploadDir);
  });

  it('filename callback produces a unique name with correct extension', () => {
    const cb = vi.fn();
    _diskStorageConfig.filename({}, { fieldname: 'image', originalname: 'test.jpg' }, cb);
    const [err, filename] = cb.mock.calls[0];
    expect(err).toBeNull();
    expect(filename).toMatch(/^image-\d+-\d+\.jpg$/);
  });

  it('fileFilter accepts valid image mimetypes', () => {
    FileUploadMiddleware.upload('image');
    const multerOptions = multer.mock.lastCall[0];
    const fileFilter = multerOptions.fileFilter;
    const cb = vi.fn();
    fileFilter({}, { mimetype: 'image/png' }, cb);
    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it('fileFilter rejects unsupported mimetypes', () => {
    FileUploadMiddleware.upload('image');
    const multerOptions = multer.mock.lastCall[0];
    const fileFilter = multerOptions.fileFilter;
    const cb = vi.fn();
    fileFilter({}, { mimetype: 'application/pdf' }, cb);
    expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
