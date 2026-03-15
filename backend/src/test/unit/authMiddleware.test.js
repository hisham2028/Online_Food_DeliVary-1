import jwt from 'jsonwebtoken';
import AuthMiddleware from '../middleware/AuthMiddleware.js';

jest.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  // ── authenticate ──────────────────────────────────────────────────────────

  describe('authenticate', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {}, body: {} };
      res = { json: jest.fn() };
      next = jest.fn();
    });

    it('returns 401-style error when no token provided', async () => {
      await AuthMiddleware.authenticate(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not Authorized. Login Again.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next() and sets userId when token is valid', async () => {
      req.headers.token = 'valid.token.here';
      jwt.verify.mockReturnValue({ id: 'user-123' });

      await AuthMiddleware.authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', 'test-secret');
      expect(req.body.userId).toBe('user-123');
      expect(next).toHaveBeenCalled();
    });

    it('returns error json when token is invalid', async () => {
      req.headers.token = 'bad.token';
      jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

      await AuthMiddleware.authenticate(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ── generateToken ─────────────────────────────────────────────────────────

  describe('generateToken', () => {
    it('calls jwt.sign with correct arguments and returns token', () => {
      jwt.sign.mockReturnValue('signed-token');

      const token = AuthMiddleware.generateToken('user-456');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-456' },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(token).toBe('signed-token');
    });
  });

  // ── verifyToken ───────────────────────────────────────────────────────────

  describe('verifyToken', () => {
    it('returns decoded payload for a valid token', () => {
      jwt.verify.mockReturnValue({ id: 'user-789' });

      const result = AuthMiddleware.verifyToken('good-token');

      expect(result).toEqual({ id: 'user-789' });
    });

    it('returns null when token verification fails', () => {
      jwt.verify.mockImplementation(() => { throw new Error('expired'); });

      const result = AuthMiddleware.verifyToken('expired-token');

      expect(result).toBeNull();
    });
  });
});
