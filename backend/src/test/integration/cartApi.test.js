/**
 * INTEGRATION TEST — Cart API Routes
 * Tests: POST /api/cart/add, POST /api/cart/remove, POST /api/cart/get, POST /api/cart/clear
 * Uses supertest against Express app with mocked DB layer.
 */
import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../models/UserModel.js', () => ({
  default: {
    findById: vi.fn(),
    updateCart: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock('../../models/FoodModel.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

const { default: UserModel } = await import('../../models/UserModel.js');
const { default: FoodModel } = await import('../../models/FoodModel.js');
const { default: CartController } = await import('../../controllers/CartController.js');
const { default: AuthMiddleware } = await import('../../middleware/AuthMiddleware.js');

let app;
let validToken;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.post('/api/cart/add', AuthMiddleware.authenticate, CartController.addToCart);
  app.post('/api/cart/remove', AuthMiddleware.authenticate, CartController.removeFromCart);
  app.post('/api/cart/get', AuthMiddleware.authenticate, CartController.getCart);
  app.post('/api/cart/clear', AuthMiddleware.authenticate, CartController.clearCart);

  validToken = AuthMiddleware.generateToken('u1');
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Cart API — Integration', () => {
  // ─── Auth ───────────────────────────────────────────────────
  describe('Authentication', () => {
    test('rejects request without token', async () => {
      const res = await request(app)
        .post('/api/cart/get')
        .send({});

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not Authorized');
    });

    test('rejects request with invalid token', async () => {
      const res = await request(app)
        .post('/api/cart/get')
        .set('token', 'bad.token.here')
        .send({});

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Add to Cart ────────────────────────────────────────────
  describe('POST /api/cart/add', () => {
    test('adds item to cart', async () => {
      FoodModel.findById.mockResolvedValue({ _id: 'food1', name: 'Pizza', isAvailable: true });
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: {} });
      UserModel.updateCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/cart/add')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Added to cart');
    });

    test('increments quantity for existing item', async () => {
      FoodModel.findById.mockResolvedValue({ _id: 'food1', name: 'Pizza', isAvailable: true });
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { food1: 1 } });
      UserModel.updateCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/cart/add')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(true);
      expect(UserModel.updateCart).toHaveBeenCalledWith('u1', { food1: 2 });
    });

    test('returns error for non-existent food', async () => {
      FoodModel.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/cart/add')
        .set('token', validToken)
        .send({ itemId: 'bad-id' });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    test('returns error for unavailable food', async () => {
      FoodModel.findById.mockResolvedValue({ _id: 'food1', name: 'Pizza', isAvailable: false });

      const res = await request(app)
        .post('/api/cart/add')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not available');
    });
  });

  // ─── Remove from Cart ──────────────────────────────────────
  describe('POST /api/cart/remove', () => {
    test('removes item from cart', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { food1: 2 } });
      UserModel.updateCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/cart/remove')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Removed from cart');
      expect(UserModel.updateCart).toHaveBeenCalledWith('u1', { food1: 1 });
    });

    test('deletes item key when quantity reaches 0', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { food1: 1 } });
      UserModel.updateCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/cart/remove')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(true);
      expect(UserModel.updateCart).toHaveBeenCalledWith('u1', {});
    });

    test('returns error when item not in cart', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: {} });

      const res = await request(app)
        .post('/api/cart/remove')
        .set('token', validToken)
        .send({ itemId: 'food1' });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not in cart');
    });
  });

  // ─── Get Cart ───────────────────────────────────────────────
  describe('POST /api/cart/get', () => {
    test('returns cart data', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { food1: 2, food2: 1 } });

      const res = await request(app)
        .post('/api/cart/get')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(true);
      expect(res.body.cartData).toEqual({ food1: 2, food2: 1 });
    });

    test('returns empty cart for new user', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'u1', cartData: {} });

      const res = await request(app)
        .post('/api/cart/get')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(true);
      expect(res.body.cartData).toEqual({});
    });

    test('returns error for non-existent user', async () => {
      UserModel.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/cart/get')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });
  });

  // ─── Clear Cart ─────────────────────────────────────────────
  describe('POST /api/cart/clear', () => {
    test('clears cart data', async () => {
      UserModel.clearCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/cart/clear')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Cart cleared');
    });
  });
});
