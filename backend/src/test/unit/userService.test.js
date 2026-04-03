/**
 * UNIT TEST — UserService
 * Tests: register, login, getProfile with mocked UserModel
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import UserService from '../../services/UserService.js';

const mockUserModel = {
  findByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn(),
  updateById: vi.fn(),
};

describe('UserService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockUserModel);
  });

  // ─── register ───────────────────────────────────────────────
  describe('register()', () => {
    test('throws if name is missing', async () => {
      await expect(service.register({ email: 'a@b.com', password: '123456' }))
        .rejects.toThrow();
    });

    test('throws if email is invalid', async () => {
      await expect(service.register({ name: 'John', email: 'bad-email', password: '123456' }))
        .rejects.toThrow();
    });

    test('throws if password is too short', async () => {
      await expect(service.register({ name: 'John', email: 'john@test.com', password: '123' }))
        .rejects.toThrow();
    });

    test('throws if user already exists', async () => {
      mockUserModel.findByEmail.mockResolvedValue({ _id: 'existing' });
      await expect(service.register({ name: 'John', email: 'john@test.com', password: '123456' }))
        .rejects.toThrow();
    });

    test('creates user and returns token on success', async () => {
      mockUserModel.findByEmail.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({ _id: 'user1', name: 'John', email: 'john@test.com' });

      const result = await service.register({ name: 'John', email: 'john@test.com', password: '123456' });

      expect(result.token).toBeDefined();
      expect(result.user.name).toBe('John');
      expect(mockUserModel.create).toHaveBeenCalledOnce();
    });

    test('hashes password before saving', async () => {
      mockUserModel.findByEmail.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@b.com' });

      await service.register({ name: 'A', email: 'a@b.com', password: 'plain123' });

      const savedData = mockUserModel.create.mock.calls[0][0];
      expect(savedData.password).not.toBe('plain123');
      expect(savedData.password.length).toBeGreaterThan(10); // bcrypt hash
    });
  });

  // ─── login ──────────────────────────────────────────────────
  describe('login()', () => {
    test('throws if email is missing', async () => {
      await expect(service.login({ password: '123456' })).rejects.toThrow();
    });

    test('throws if user not found', async () => {
      mockUserModel.findByEmail.mockResolvedValue(null);
      await expect(service.login({ email: 'no@user.com', password: '123456' }))
        .rejects.toThrow('Invalid credentials');
    });

    test('throws if password is wrong', async () => {
      mockUserModel.findByEmail.mockResolvedValue({
        _id: 'u1', password: '$2a$10$invalidhash',
      });
      await expect(service.login({ email: 'a@b.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    test('returns token on valid credentials', async () => {
      // First register to get a real hash
      mockUserModel.findByEmail.mockResolvedValueOnce(null);
      mockUserModel.create.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@b.com' });
      const { user } = await service.register({ name: 'A', email: 'a@b.com', password: 'test1234' });

      // Now mock login
      const hashedPw = mockUserModel.create.mock.calls[0][0].password;
      mockUserModel.findByEmail.mockResolvedValue({
        _id: 'u1', name: 'A', email: 'a@b.com', password: hashedPw,
      });
      mockUserModel.updateById.mockResolvedValue({});

      const result = await service.login({ email: 'a@b.com', password: 'test1234' });
      expect(result.token).toBeDefined();
    });
  });

  // ─── getProfile ─────────────────────────────────────────────
  describe('getProfile()', () => {
    test('throws if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      await expect(service.getProfile('badId')).rejects.toThrow('User not found');
    });

    test('returns user data without password', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@b.com' });
      const result = await service.getProfile('u1');
      expect(result.name).toBe('A');
      expect(result.password).toBeUndefined();
    });
  });
});
