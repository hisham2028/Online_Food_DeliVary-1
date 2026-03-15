/**
 * INTEGRATION TEST — User API Routes
 * Tests: POST /api/user/register, POST /api/user/login, GET /api/user/profile
 * Uses supertest against Express app with mocked DB layer.
 */
import { describe, test, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash('test1234', 10);

vi.mock('../../models/UserModel.js', () => ({
  default: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
  },
}));

const { default: UserModel } = await import('../../models/UserModel.js');
const { default: UserController } = await import('../../controllers/UserController.js');
const { default: AuthMiddleware } = await import('../../middleware/AuthMiddleware.js');

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.post('/api/user/register', UserController.register);
  app.post('/api/user/login', UserController.login);
  app.get('/api/user/profile', AuthMiddleware.authenticate, UserController.getUserProfile);
});

describe('User API — Integration', () => {
  // ─── Register ───────────────────────────────────────────────
  describe('POST /api/user/register', () => {
    test('registers new user and returns token', async () => {
      UserModel.findByEmail.mockResolvedValue(null);
      UserModel.create.mockResolvedValue({ _id: 'u1', name: 'John', email: 'john@test.com' });

      const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'John', email: 'john@test.com', password: 'test1234' });

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('rejects registration with existing email', async () => {
      UserModel.findByEmail.mockResolvedValue({ _id: 'existing' });

      const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'John', email: 'john@test.com', password: 'test1234' });

      expect(res.body.success).toBe(false);
    });

    test('rejects registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'John', email: 'bad-email', password: 'test1234' });

      expect(res.body.success).toBe(false);
    });

    test('rejects registration with short password', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({ name: 'John', email: 'john@test.com', password: '123' });

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Login ──────────────────────────────────────────────────
  describe('POST /api/user/login', () => {
    test('returns token for valid credentials', async () => {
      UserModel.findByEmail.mockResolvedValue({
        _id: 'u1', name: 'John', email: 'john@test.com', password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/user/login')
        .send({ email: 'john@test.com', password: 'test1234' });

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('rejects invalid password', async () => {
      UserModel.findByEmail.mockResolvedValue({
        _id: 'u1', password: hashedPassword,
      });

      const res = await request(app)
        .post('/api/user/login')
        .send({ email: 'john@test.com', password: 'wrongpass' });

      expect(res.body.success).toBe(false);
    });

    test('rejects non-existent user', async () => {
      UserModel.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/user/login')
        .send({ email: 'nobody@test.com', password: 'test1234' });

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Profile ────────────────────────────────────────────────
  describe('GET /api/user/profile', () => {
    test('returns profile for authenticated user', async () => {
      const token = AuthMiddleware.generateToken('u1');
      UserModel.findById.mockResolvedValue({
        _id: 'u1', name: 'John', email: 'john@test.com', password: hashedPassword,
        toObject() { return { _id: 'u1', name: 'John', email: 'john@test.com', password: hashedPassword }; },
      });

      const res = await request(app)
        .get('/api/user/profile')
        .set('token', token);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John');
      expect(res.body.data.password).toBeUndefined();
    });

    test('rejects request without token', async () => {
      const res = await request(app).get('/api/user/profile');

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not Authorized');
    });

    test('rejects request with invalid token', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('token', 'bad.token.here');

      expect(res.body.success).toBe(false);
    });
  });
});
