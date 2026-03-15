/**
 * INTEGRATION TEST — Order API Routes
 * Tests: POST /api/order/place, POST /api/order/verify, POST /api/order/userorders,
 *        GET /api/order/list, POST /api/order/status, GET /api/order/:id, POST /api/order/cancel
 * Uses supertest against Express app with mocked DB layer.
 */
import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../models/OrderModel.js', () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findAll: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    deleteById: vi.fn(),
  },
}));

vi.mock('../../models/UserModel.js', () => ({
  default: {
    findById: vi.fn(),
    clearCart: vi.fn(),
  },
}));

vi.mock('../../models/FoodModel.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../../strategies/PaymentStrategy.js', () => {
  class MockPaymentProcessor {
    setStrategy() { return this; }
    async processPayment() {
      return { type: 'cod', message: 'Order Placed. Pay on delivery.' };
    }
  }
  return { PaymentProcessor: MockPaymentProcessor };
});

const { default: OrderModel } = await import('../../models/OrderModel.js');
const { default: UserModel } = await import('../../models/UserModel.js');
const { default: FoodModel } = await import('../../models/FoodModel.js');
const { default: OrderController } = await import('../../controllers/OrderController.js');
const { default: AuthMiddleware } = await import('../../middleware/AuthMiddleware.js');

let app;
let validToken;

const sampleOrder = {
  _id: 'ord1',
  userId: 'u1',
  items: [{ _id: 'food1', name: 'Pizza', quantity: 2 }],
  amount: 25,
  address: { firstName: 'John', street: '123 Main St', city: 'NYC' },
  status: 'Food Processing',
  payment: false,
  date: new Date().toISOString(),
};

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.post('/api/order/place', AuthMiddleware.authenticate, OrderController.placeOrder);
  app.post('/api/order/verify', OrderController.verifyOrder);
  app.post('/api/order/userorders', AuthMiddleware.authenticate, OrderController.getUserOrders);
  app.get('/api/order/list', OrderController.listOrders);
  app.post('/api/order/status', OrderController.updateStatus);
  app.get('/api/order/:id', OrderController.getOrderById);
  app.post('/api/order/cancel', AuthMiddleware.authenticate, OrderController.cancelOrder);

  validToken = AuthMiddleware.generateToken('u1');
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Order API — Integration', () => {
  // ─── Place Order ────────────────────────────────────────────
  describe('POST /api/order/place', () => {
    test('places a COD order successfully', async () => {
      FoodModel.findById.mockResolvedValue({ _id: 'food1', name: 'Pizza', isAvailable: true });
      OrderModel.create.mockResolvedValue({ ...sampleOrder });
      UserModel.clearCart.mockResolvedValue({});

      const res = await request(app)
        .post('/api/order/place')
        .set('token', validToken)
        .send({
          items: [{ _id: 'food1', name: 'Pizza', quantity: 2 }],
          amount: 25,
          address: { firstName: 'John', street: '123 Main St' },
          paymentMethod: 'cod',
        });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Order Placed');
    });

    test('rejects order without auth token', async () => {
      const res = await request(app)
        .post('/api/order/place')
        .send({ items: [], amount: 0, address: {} });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not Authorized');
    });

    test('returns error on internal failure', async () => {
      FoodModel.findById.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/order/place')
        .set('token', validToken)
        .send({
          items: [{ _id: 'food1', name: 'Pizza', quantity: 1 }],
          amount: 12,
          address: {},
        });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Error placing order');
    });
  });

  // ─── Verify Order ──────────────────────────────────────────
  describe('POST /api/order/verify', () => {
    test('verifies payment successfully', async () => {
      OrderModel.findById.mockResolvedValue({ ...sampleOrder });
      OrderModel.updatePaymentStatus.mockResolvedValue({});

      const res = await request(app)
        .post('/api/order/verify')
        .send({ orderId: 'ord1', success: 'true' });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Payment verified');
    });

    test('deletes order on failed payment', async () => {
      OrderModel.findById.mockResolvedValue({ ...sampleOrder });
      OrderModel.deleteById.mockResolvedValue({});

      const res = await request(app)
        .post('/api/order/verify')
        .send({ orderId: 'ord1', success: 'false' });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Payment failed');
      expect(OrderModel.deleteById).toHaveBeenCalledWith('ord1');
    });

    test('returns error for non-existent order', async () => {
      OrderModel.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/order/verify')
        .send({ orderId: 'bad-id', success: 'true' });

      expect(res.body.success).toBe(false);
    });
  });

  // ─── User Orders ───────────────────────────────────────────
  describe('POST /api/order/userorders', () => {
    test('returns user orders', async () => {
      OrderModel.findByUserId.mockResolvedValue([sampleOrder]);

      const res = await request(app)
        .post('/api/order/userorders')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]._id).toBe('ord1');
    });

    test('returns empty array for user with no orders', async () => {
      OrderModel.findByUserId.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/order/userorders')
        .set('token', validToken)
        .send({});

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/order/userorders')
        .send({});

      expect(res.body.success).toBe(false);
    });
  });

  // ─── List Orders (Admin) ───────────────────────────────────
  describe('GET /api/order/list', () => {
    test('returns all orders', async () => {
      OrderModel.findAll.mockResolvedValue([sampleOrder, { ...sampleOrder, _id: 'ord2' }]);

      const res = await request(app).get('/api/order/list');

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    test('returns empty list when no orders', async () => {
      OrderModel.findAll.mockResolvedValue([]);

      const res = await request(app).get('/api/order/list');

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // ─── Update Status ─────────────────────────────────────────
  describe('POST /api/order/status', () => {
    test('updates order status', async () => {
      OrderModel.updateStatus.mockResolvedValue({ ...sampleOrder, status: 'Delivered' });

      const res = await request(app)
        .post('/api/order/status')
        .send({ orderId: 'ord1', status: 'Delivered' });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Status Updated');
    });

    test('rejects invalid status', async () => {
      OrderModel.updateStatus.mockImplementation(() => {
        throw new Error('Invalid status');
      });

      const res = await request(app)
        .post('/api/order/status')
        .send({ orderId: 'ord1', status: 'InvalidStatus' });

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Get Order By ID ───────────────────────────────────────
  describe('GET /api/order/:id', () => {
    test('returns order by ID', async () => {
      OrderModel.findById.mockResolvedValue(sampleOrder);

      const res = await request(app).get('/api/order/ord1');

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe('ord1');
    });

    test('returns 404 for non-existent order', async () => {
      OrderModel.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/order/bad-id');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });
  });

  // ─── Cancel Order ──────────────────────────────────────────
  describe('POST /api/order/cancel', () => {
    test('cancels a processing order', async () => {
      OrderModel.findById.mockResolvedValue({ ...sampleOrder, userId: 'u1' });
      OrderModel.updateStatus.mockResolvedValue({ ...sampleOrder, status: 'Cancelled' });

      const res = await request(app)
        .post('/api/order/cancel')
        .set('token', validToken)
        .send({ orderId: 'ord1' });

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order cancelled successfully');
    });

    test('rejects cancellation of delivered order', async () => {
      OrderModel.findById.mockResolvedValue({ ...sampleOrder, userId: 'u1', status: 'Delivered' });

      const res = await request(app)
        .post('/api/order/cancel')
        .set('token', validToken)
        .send({ orderId: 'ord1' });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot cancel');
    });

    test('returns 404 for non-existent order', async () => {
      OrderModel.findById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/order/cancel')
        .set('token', validToken)
        .send({ orderId: 'bad-id' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/order/cancel')
        .send({ orderId: 'ord1' });

      expect(res.body.success).toBe(false);
    });
  });
});
