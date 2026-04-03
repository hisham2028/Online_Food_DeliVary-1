/**
 * OrderController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderService from '../../services/OrderService.js';

vi.mock('../../services/OrderService.js', () => ({
  default: vi.fn()
}));

const mockOrderService = {
  createOrder: vi.fn(),
  verifyPayment: vi.fn(),
  getUserOrders: vi.fn(),
  getAllOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
  getOrderById: vi.fn(),
  cancelOrder: vi.fn()
};

OrderService.mockImplementation(() => mockOrderService);

import OrderController from '../../controllers/OrderController.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('OrderController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('placeOrder', () => {
    it('returns session_url for card payment', async () => {
      mockOrderService.createOrder.mockResolvedValue({
        payment: { type: 'card', session_url: 'https://stripe.com/session' }
      });

      const req = { body: { userId: 'u1', items: [], amount: 100, address: {}, paymentMethod: 'card' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        session_url: 'https://stripe.com/session'
      });
    });

    it('returns message for COD payment', async () => {
      mockOrderService.createOrder.mockResolvedValue({
        payment: { type: 'cod', message: 'Order Placed' }
      });

      const req = { body: { userId: 'u1', items: [], amount: 50, address: {}, paymentMethod: 'cod' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order Placed' });
    });

    it('returns error on exception', async () => {
      mockOrderService.createOrder.mockRejectedValue(new Error('DB error'));

      const req = { body: {} };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error placing order' });
    });
  });

  describe('verifyOrder', () => {
    it('returns service result on success', async () => {
      mockOrderService.verifyPayment.mockResolvedValue({ success: true, message: 'Payment verified' });

      const req = { body: { orderId: 'o1', success: 'true' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Payment verified' });
    });

    it('returns error on exception', async () => {
      mockOrderService.verifyPayment.mockRejectedValue(new Error('fail'));

      const req = { body: { orderId: 'o1', success: 'false' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error verifying order' });
    });
  });

  describe('getUserOrders', () => {
    it('returns orders for a user', async () => {
      const orders = [{ _id: 'o1' }];
      mockOrderService.getUserOrders.mockResolvedValue(orders);

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });

    it('returns error on exception', async () => {
      mockOrderService.getUserOrders.mockRejectedValue(new Error('fail'));

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error fetching user orders' });
    });
  });

  describe('listOrders', () => {
    it('returns all orders', async () => {
      const orders = [{ _id: 'o1' }, { _id: 'o2' }];
      mockOrderService.getAllOrders.mockResolvedValue(orders);

      const req = {};
      const res = mockRes();

      await OrderController.listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });

    it('returns error on exception', async () => {
      mockOrderService.getAllOrders.mockRejectedValue(new Error('fail'));

      const req = {};
      const res = mockRes();

      await OrderController.listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error collecting orders' });
    });
  });

  describe('updateStatus', () => {
    it('updates order status successfully', async () => {
      mockOrderService.updateOrderStatus.mockResolvedValue({});

      const req = { body: { orderId: 'o1', status: 'Delivered' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith('o1', 'Delivered');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Status Updated' });
    });

    it('returns error message from service', async () => {
      mockOrderService.updateOrderStatus.mockRejectedValue(new Error('Invalid status'));

      const req = { body: { orderId: 'o1', status: 'Bad' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid status' });
    });
  });

  describe('getOrderById', () => {
    it('returns order by id', async () => {
      const order = { _id: 'o1', status: 'Processing' };
      mockOrderService.getOrderById.mockResolvedValue(order);

      const req = { params: { id: 'o1' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: order });
    });

    it('responds 404 when order not found', async () => {
      mockOrderService.getOrderById.mockRejectedValue(new Error('Order not found'));

      const req = { params: { id: 'bad' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });

    it('returns generic error for other exceptions', async () => {
      mockOrderService.getOrderById.mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'o1' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error fetching order' });
    });
  });

  describe('cancelOrder', () => {
    it('cancels order successfully', async () => {
      mockOrderService.cancelOrder.mockResolvedValue({});

      const req = { body: { orderId: 'o1', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order cancelled successfully' });
    });

    it('responds 404 when order not found', async () => {
      mockOrderService.cancelOrder.mockRejectedValue(new Error('Order not found'));

      const req = { body: { orderId: 'bad', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns error message for other failures', async () => {
      mockOrderService.cancelOrder.mockRejectedValue(new Error('Cannot cancel'));

      const req = { body: { orderId: 'o1', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot cancel' });
    });
  });
});
