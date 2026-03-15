/**
 * OrderController unit tests
 */

const mockCreateOrder      = jest.fn();
const mockVerifyPayment    = jest.fn();
const mockGetUserOrders    = jest.fn();
const mockGetAllOrders     = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockGetOrderById     = jest.fn();
const mockCancelOrder      = jest.fn();

jest.mock('../services/OrderService.js', () =>
  jest.fn().mockImplementation(() => ({
    createOrder:       mockCreateOrder,
    verifyPayment:     mockVerifyPayment,
    getUserOrders:     mockGetUserOrders,
    getAllOrders:       mockGetAllOrders,
    updateOrderStatus: mockUpdateOrderStatus,
    getOrderById:      mockGetOrderById,
    cancelOrder:       mockCancelOrder,
  }))
);

import OrderController from '../controllers/OrderController.js';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('OrderController', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── placeOrder ─────────────────────────────────────────────────────────────

  describe('placeOrder', () => {
    it('returns session_url for card payment', async () => {
      mockCreateOrder.mockResolvedValue({
        payment: { type: 'card', session_url: 'https://stripe.com/session' },
      });

      const req = { body: { userId: 'u1', items: [], amount: 100, address: {}, paymentMethod: 'card' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        session_url: 'https://stripe.com/session',
      });
    });

    it('returns message for COD payment', async () => {
      mockCreateOrder.mockResolvedValue({
        payment: { type: 'cod', message: 'Order Placed' },
      });

      const req = { body: { userId: 'u1', items: [], amount: 50, address: {}, paymentMethod: 'cod' } };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order Placed' });
    });

    it('returns error on exception', async () => {
      mockCreateOrder.mockRejectedValue(new Error('DB error'));

      const req = { body: {} };
      const res = mockRes();

      await OrderController.placeOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error placing order' });
    });
  });

  // ── verifyOrder ────────────────────────────────────────────────────────────

  describe('verifyOrder', () => {
    it('returns service result on success', async () => {
      mockVerifyPayment.mockResolvedValue({ success: true, message: 'Payment verified' });

      const req = { body: { orderId: 'o1', success: 'true' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Payment verified' });
    });

    it('returns error on exception', async () => {
      mockVerifyPayment.mockRejectedValue(new Error('fail'));

      const req = { body: { orderId: 'o1', success: 'false' } };
      const res = mockRes();

      await OrderController.verifyOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error verifying order' });
    });
  });

  // ── getUserOrders ──────────────────────────────────────────────────────────

  describe('getUserOrders', () => {
    it('returns orders for a user', async () => {
      const orders = [{ _id: 'o1' }];
      mockGetUserOrders.mockResolvedValue(orders);

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });

    it('returns error on exception', async () => {
      mockGetUserOrders.mockRejectedValue(new Error('fail'));

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await OrderController.getUserOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error fetching user orders' });
    });
  });

  // ── listOrders ─────────────────────────────────────────────────────────────

  describe('listOrders', () => {
    it('returns all orders', async () => {
      const orders = [{ _id: 'o1' }, { _id: 'o2' }];
      mockGetAllOrders.mockResolvedValue(orders);

      const req = {};
      const res = mockRes();

      await OrderController.listOrders(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: orders });
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('updates order status successfully', async () => {
      mockUpdateOrderStatus.mockResolvedValue({});

      const req = { body: { orderId: 'o1', status: 'Delivered' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(mockUpdateOrderStatus).toHaveBeenCalledWith('o1', 'Delivered');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Status Updated' });
    });

    it('returns error message from service', async () => {
      mockUpdateOrderStatus.mockRejectedValue(new Error('Invalid status'));

      const req = { body: { orderId: 'o1', status: 'Bad' } };
      const res = mockRes();

      await OrderController.updateStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid status' });
    });
  });

  // ── getOrderById ───────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    it('returns order by id', async () => {
      const order = { _id: 'o1', status: 'Processing' };
      mockGetOrderById.mockResolvedValue(order);

      const req = { params: { id: 'o1' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: order });
    });

    it('responds 404 when order not found', async () => {
      mockGetOrderById.mockRejectedValue(new Error('Order not found'));

      const req = { params: { id: 'bad' } };
      const res = mockRes();

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
    });
  });

  // ── cancelOrder ────────────────────────────────────────────────────────────

  describe('cancelOrder', () => {
    it('cancels order successfully', async () => {
      mockCancelOrder.mockResolvedValue({});

      const req = { body: { orderId: 'o1', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Order cancelled successfully' });
    });

    it('responds 404 when order not found', async () => {
      mockCancelOrder.mockRejectedValue(new Error('Order not found'));

      const req = { body: { orderId: 'bad', userId: 'u1' } };
      const res = mockRes();

      await OrderController.cancelOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
