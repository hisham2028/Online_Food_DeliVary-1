/**
 * OrderController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/OrderModel.js', () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findAll: vi.fn(),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    deleteById: vi.fn(),
  }
}));

vi.mock('../../models/UserModel.js', () => ({
  default: {
    updateById: vi.fn(),
  }
}));

vi.mock('../../services/StripeService.js', () => ({
  default: {
    formatLineItems: vi.fn().mockReturnValue([{ price_data: {}, quantity: 1 }]),
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://stripe.com/session' })
  }
}));

const { default: OrderModel } = await import('../../models/OrderModel.js');
const { default: UserModel } = await import('../../models/UserModel.js');
const { default: OrderController } = await import('../../controllers/OrderController.js');

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('OrderController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('placeOrder', () => {
    it('returns message for COD payment', async () => {
      OrderModel.create.mockResolvedValue({ _id: 'o1' });
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'u1', items: [], amount: 50, address: {}, paymentMethod: 'cod' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order Placed' });
    });

    it('returns session_url for card payment', async () => {
      OrderModel.create.mockResolvedValue({ _id: 'o1' });
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'u1', items: [], amount: 100, address: {}, paymentMethod: 'card' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, session_url: 'https://stripe.com/session' });
    });

    it('returns error on exception', async () => {
      OrderModel.create.mockRejectedValue(new Error('DB error'));

      const req = { body: {} };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error placing order' });
    });
  });

  describe('verifyOrder', () => {
    it('returns Paid on successful payment verification', async () => {
      OrderModel.updatePaymentStatus.mockResolvedValue({});

      const req = { body: { orderId: 'o1', success: 'true' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Paid' });
    });

    it('returns Not Paid on failed payment', async () => {
      OrderModel.deleteById.mockResolvedValue({});

      const req = { body: { orderId: 'o1', success: 'false' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Paid' });
    });

    it('returns error on exception', async () => {
      OrderModel.updatePaymentStatus.mockRejectedValue(new Error('fail'));

      const req = { body: { orderId: 'o1', success: 'true' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error verifying order' });
    });
  });

  describe('getUserOrders', () => {
    it('returns orders for a user', async () => {
      const orders = [{ _id: 'o1' }];
      OrderModel.findByUserId.mockResolvedValue(orders);

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });

    it('returns error on exception', async () => {
      OrderModel.findByUserId.mockRejectedValue(new Error('fail'));

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error fetching user orders' });
    });
  });

  describe('listOrders', () => {
    it('returns all orders', async () => {
      const orders = [{ _id: 'o1' }, { _id: 'o2' }];
      OrderModel.findAll.mockResolvedValue(orders);

      const req = {};
      const res = mockRes();

      await OrderController.listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });

    it('returns error on exception', async () => {
      OrderModel.findAll.mockRejectedValue(new Error('fail'));

      const req = {};
      const res = mockRes();

      await OrderController.listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error collecting orders' });
    });
  });

  describe('updateStatus', () => {
    it('updates order status successfully', async () => {
      OrderModel.updateStatus.mockResolvedValue({ _id: 'o1', status: 'Delivered' });

      const req = { body: { orderId: 'o1', status: 'Delivered' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(OrderModel.updateStatus).toHaveBeenCalledWith('o1', 'Delivered');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Status Updated' });
    });

    it('returns error on exception', async () => {
      OrderModel.updateStatus.mockRejectedValue(new Error('Invalid status'));

      const req = { body: { orderId: 'o1', status: 'Bad' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('getOrderById', () => {
    it('returns order by id', async () => {
      const order = { _id: 'o1', status: 'Processing' };
      OrderModel.findById.mockResolvedValue(order);

      const req = { params: { id: 'o1' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: order });
    });

    it('responds 404 when order not found', async () => {
      OrderModel.findById.mockResolvedValue(null);

      const req = { params: { id: 'bad' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });
  });

  describe('cancelOrder', () => {
    it('cancels order successfully', async () => {
      OrderModel.findById.mockResolvedValue({ _id: 'o1', status: 'Food Processing' });
      OrderModel.updateStatus.mockResolvedValue({ _id: 'o1', status: 'Cancelled' });

      const req = { body: { orderId: 'o1', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order cancelled successfully' });
    });

    it('responds 404 when order not found', async () => {
      OrderModel.findById.mockResolvedValue(null);

      const req = { body: { orderId: 'bad', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns error for order that cannot be cancelled', async () => {
      OrderModel.findById.mockResolvedValue({ _id: 'o1', status: 'Delivered' });

      const req = { body: { orderId: 'o1', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
