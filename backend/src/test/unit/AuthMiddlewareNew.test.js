/**
 * AuthMiddleware unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}));

import AuthMiddleware from '../../middleware/AuthMiddleware.js';

const { authenticate } = AuthMiddleware;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('AuthMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('authenticate', () => {
    it('calls next() with valid token', () => {
      jwt.verify.mockReturnValue({ id: 'user123' });

      const req = { headers: { token: 'valid-jwt-token' }, body: {} };
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid-jwt-token', process.env.JWT_SECRET);
      expect(req.body.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('returns 401 when no token provided', () => {
      const req = { headers: {}, body: {} };
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Authorized. Login Again.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const req = { headers: { token: 'invalid-token' }, body: {} };
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is expired', () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const req = { headers: { token: 'expired-token' }, body: {} };
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('handles malformed token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      const req = { headers: { token: 'malformed' }, body: {} };
      const res = mockRes();
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
