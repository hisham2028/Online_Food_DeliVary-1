/**
 * UserController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserService from '../../services/UserService.js';

vi.mock('../../services/UserService.js', () => ({
  default: vi.fn()
}));

const mockUserService = {
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn()
};

UserService.mockImplementation(() => mockUserService);

import UserController from '../../controllers/UserController.js';

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
      mockUserService.login.mockResolvedValue({ token: 'jwt-token-123' });

      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'jwt-token-123' });
    });

    it('returns error on invalid credentials', async () => {
      mockUserService.login.mockRejectedValue(new Error('Invalid credentials'));

      const req = { body: { email: 'test@example.com', password: 'wrong' } };
      const res = mockRes();

      await UserController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });
  });

  describe('register', () => {
    it('returns token on successful registration', async () => {
      mockUserService.register.mockResolvedValue({ token: 'new-jwt-token' });

      const req = { body: { name: 'Test User', email: 'new@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'new-jwt-token' });
    });

    it('returns error when user already exists', async () => {
      mockUserService.register.mockRejectedValue(new Error('User already exists'));

      const req = { body: { name: 'Test', email: 'exists@example.com', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User already exists' });
    });

    it('returns error for invalid email', async () => {
      mockUserService.register.mockRejectedValue(new Error('Enter a valid email'));

      const req = { body: { name: 'Test', email: 'invalid', password: 'password123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Enter a valid email' });
    });

    it('returns error for short password', async () => {
      mockUserService.register.mockRejectedValue(new Error('Password must be at least 6 characters'));

      const req = { body: { name: 'Test', email: 'test@example.com', password: '123' } };
      const res = mockRes();

      await UserController.register(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Password must be at least 6 characters' });
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      const profile = { name: 'Test User', email: 'test@example.com' };
      mockUserService.getProfile.mockResolvedValue(profile);

      const req = { body: { userId: 'user123' } };
      const res = mockRes();

      await UserController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: profile });
    });

    it('returns error when user not found', async () => {
      mockUserService.getProfile.mockRejectedValue(new Error('User not found'));

      const req = { body: { userId: 'invalid' } };
      const res = mockRes();

      await UserController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });
});
