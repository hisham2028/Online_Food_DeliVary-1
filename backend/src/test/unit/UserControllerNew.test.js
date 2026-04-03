/**
 * UserController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/UserModel.js', () => ({
  default: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
  }
}));

vi.mock('../../middleware/AuthMiddleware.js', () => ({
  default: {
    authenticate: vi.fn(),
    generateToken: vi.fn().mockReturnValue('mocked-token'),
    verifyToken: vi.fn(),
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    genSalt: vi.fn().mockResolvedValue('salt'),
    hash: vi.fn().mockResolvedValue('hashed-password'),
  }
}));

vi.mock('validator', () => ({
  default: { isEmail: vi.fn().mockReturnValue(true) }
}));

const { default: UserModel } = await import('../../models/UserModel.js');
const { default: AuthMiddleware } = await import('../../middleware/AuthMiddleware.js');
const bcrypt = (await import('bcryptjs')).default;
const validator = (await import('validator')).default;
const { default: UserController } = await import('../../controllers/UserContoller.js');

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('login', () => {
    it('returns token on successful login', async () => {
      UserModel.findByEmail.mockResolvedValue({ _id: 'u1', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(true);
      AuthMiddleware.generateToken.mockReturnValue('jwt-token-123');

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'jwt-token-123' });
    });

    it('returns error on invalid credentials (wrong password)', async () => {
      UserModel.findByEmail.mockResolvedValue({ _id: 'u1', password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      const req = { body: { email: 'test@example.com', password: 'wrong' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns error when user not found', async () => {
      UserModel.findByEmail.mockResolvedValue(null);

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns error when fields missing', async () => {
      const req = { body: {} };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('register', () => {
    it('returns token on successful registration', async () => {
      validator.isEmail.mockReturnValue(true);
      UserModel.findByEmail.mockResolvedValue(null);
      UserModel.create.mockResolvedValue({ _id: 'u1', name: 'Test User', email: 'new@example.com' });
      AuthMiddleware.generateToken.mockReturnValue('new-jwt-token');

      const req = { body: { name: 'Test User', email: 'new@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'new-jwt-token' });
    });

    it('returns error when user already exists', async () => {
      validator.isEmail.mockReturnValue(true);
      UserModel.findByEmail.mockResolvedValue({ _id: 'existing' });

      const req = { body: { name: 'Test', email: 'exists@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns error for invalid email', async () => {
      validator.isEmail.mockReturnValue(false);

      const req = { body: { name: 'Test', email: 'invalid', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns error for short password', async () => {
      validator.isEmail.mockReturnValue(true);

      const req = { body: { name: 'Test', email: 'test@example.com', password: '123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('getUserProfile', () => {
    it('returns user profile', async () => {
      const userObj = { _id: 'u1', name: 'Test User', email: 'test@example.com' };
      UserModel.findById.mockResolvedValue({
        ...userObj,
        toObject() { return userObj; }
      });

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await UserController.getUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: userObj });
    });

    it('returns error when user not found', async () => {
      UserModel.findById.mockResolvedValue(null);

      const req = { body: { userId: 'invalid' } };
      const res = mockRes();

      await UserController.getUserProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('returns 500 on server error', async () => {
      UserModel.findById.mockRejectedValue(new Error('DB error'));

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await UserController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login - server error', () => {
    it('returns 500 on unexpected error', async () => {
      UserModel.findByEmail.mockRejectedValue(new Error('DB error'));

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('register - server error', () => {
    it('returns 500 on unexpected error', async () => {
      validator.isEmail.mockReturnValue(true);
      UserModel.findByEmail.mockRejectedValue(new Error('DB error'));

      const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProfile', () => {
    it('updates profile name successfully', async () => {
      const updatedUser = { _id: 'u1', name: 'Updated Name', email: 'test@example.com' };
      UserModel.updateById.mockResolvedValue({
        ...updatedUser,
        toObject() { return updatedUser; }
      });

      const req = { body: { userId: 'u1', name: 'Updated Name' } };
      const res = mockRes();

      await UserController.updateProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    });

    it('returns 400 when name is missing', async () => {
      const req = { body: { userId: 'u1', name: '' } };
      const res = mockRes();

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when name is whitespace only', async () => {
      const req = { body: { userId: 'u1', name: '   ' } };
      const res = mockRes();

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when user not found', async () => {
      UserModel.updateById.mockResolvedValue(null);

      const req = { body: { userId: 'invalid', name: 'Alice' } };
      const res = mockRes();

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on server error', async () => {
      UserModel.updateById.mockRejectedValue(new Error('DB error'));

      const req = { body: { userId: 'u1', name: 'Alice' } };
      const res = mockRes();

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
