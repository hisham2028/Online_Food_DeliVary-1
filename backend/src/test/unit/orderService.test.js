/**
 * UNIT TEST — OrderService
 * Tests: createOrder, verifyPayment, getUserOrders, getAllOrders,
 *        updateOrderStatus, cancelOrder, _validateOrderItems
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import OrderService from '../../services/OrderService.js';

// Mock PaymentStrategy
vi.mock('../../strategies/PaymentStrategy.js', () => {
  class MockPaymentProcessor {
    constructor() {
      this.currentStrategy = null;
    }
    setStrategy() { return this; }
    async processPayment() { return { type: 'cod', message: 'Order Placed' }; }
  }
  return {
    PaymentProcessor: MockPaymentProcessor,
  };
});

const mockOrderModel = {
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findAll: vi.fn(),
  updatePaymentStatus: vi.fn(),
  updateStatus: vi.fn(),
  deleteById: vi.fn(),
};

const mockUserModel = {
  clearCart: vi.fn(),
};

const mockFoodModel = {
  findById: vi.fn(),
};

describe('OrderService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new OrderService(mockOrderModel, mockUserModel, mockFoodModel);
  });

  // ─── createOrder ────────────────────────────────────────────
  describe('createOrder()', () => {
    const orderData = {
      userId: 'u1',
      items: [{ _id: 'f1', name: 'Pizza', price: 12, quantity: 1 }],
      amount: 12,
      address: { street: '123 Main' },
      paymentMethod: 'cod',
    };

    test('validates items, creates order, processes payment, clears cart', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: true });
      mockOrderModel.create.mockResolvedValue({ _id: 'order1', ...orderData });
      mockUserModel.clearCart.mockResolvedValue({});

      const result = await service.createOrder(orderData);

      expect(mockFoodModel.findById).toHaveBeenCalledWith('f1');
      expect(mockOrderModel.create).toHaveBeenCalledOnce();
      expect(mockUserModel.clearCart).toHaveBeenCalledWith('u1');
      expect(result.order).toBeDefined();
      expect(result.payment).toBeDefined();
    });

    test('throws if food item not found during validation', async () => {
      mockFoodModel.findById.mockResolvedValue(null);
      await expect(service.createOrder(orderData)).rejects.toThrow('Food item not found');
    });

    test('throws if food item not available', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: false });
      await expect(service.createOrder(orderData)).rejects.toThrow('Food item not available');
    });
  });

  // ─── verifyPayment ──────────────────────────────────────────
  describe('verifyPayment()', () => {
    test('marks order as paid when success is true', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1' });
      mockOrderModel.updatePaymentStatus.mockResolvedValue({});

      const result = await service.verifyPayment('o1', 'true');
      expect(result.success).toBe(true);
      expect(mockOrderModel.updatePaymentStatus).toHaveBeenCalledWith('o1', true);
    });

    test('deletes order when success is false', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1' });
      mockOrderModel.deleteById.mockResolvedValue({});

      const result = await service.verifyPayment('o1', 'false');
      expect(result.success).toBe(false);
      expect(mockOrderModel.deleteById).toHaveBeenCalledWith('o1');
    });

    test('throws if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);
      await expect(service.verifyPayment('bad', 'true')).rejects.toThrow('Order not found');
    });
  });

  // ─── getUserOrders ──────────────────────────────────────────
  describe('getUserOrders()', () => {
    test('returns orders for a user', async () => {
      const orders = [{ _id: 'o1' }, { _id: 'o2' }];
      mockOrderModel.findByUserId.mockResolvedValue(orders);

      const result = await service.getUserOrders('u1');
      expect(result).toEqual(orders);
      expect(mockOrderModel.findByUserId).toHaveBeenCalledWith('u1', expect.any(Object));
    });
  });

  // ─── getOrderById ──────────────────────────────────────────
  describe('getOrderById()', () => {
    test('returns order if found', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1', amount: 25 });
      const result = await service.getOrderById('o1');
      expect(result.amount).toBe(25);
    });

    test('throws if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);
      await expect(service.getOrderById('bad')).rejects.toThrow('Order not found');
    });
  });

  // ─── updateOrderStatus ─────────────────────────────────────
  describe('updateOrderStatus()', () => {
    test('updates status for valid status string', async () => {
      mockOrderModel.updateStatus.mockResolvedValue({ _id: 'o1', status: 'Delivered' });
      const result = await service.updateOrderStatus('o1', 'Delivered');
      expect(result.status).toBe('Delivered');
    });

    test('throws for invalid status string', async () => {
      await expect(service.updateOrderStatus('o1', 'Flying'))
        .rejects.toThrow('Invalid status');
    });

    test('throws if order not found during update', async () => {
      mockOrderModel.updateStatus.mockResolvedValue(null);
      await expect(service.updateOrderStatus('bad', 'Delivered'))
        .rejects.toThrow('Order not found');
    });
  });

  // ─── cancelOrder ────────────────────────────────────────────
  describe('cancelOrder()', () => {
    test('cancels order in Food Processing status', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1', status: 'Food Processing', userId: 'u1' });
      mockOrderModel.updateStatus.mockResolvedValue({ _id: 'o1', status: 'Cancelled' });

      const result = await service.cancelOrder('o1', 'u1');
      expect(mockOrderModel.updateStatus).toHaveBeenCalledWith('o1', 'Cancelled');
    });

    test('throws if order is already Delivered', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1', status: 'Delivered', userId: 'u1' });
      await expect(service.cancelOrder('o1', 'u1')).rejects.toThrow('Cannot cancel delivered order');
    });

    test('throws if userId does not match', async () => {
      mockOrderModel.findById.mockResolvedValue({ _id: 'o1', status: 'Food Processing', userId: 'u1' });
      await expect(service.cancelOrder('o1', 'u999')).rejects.toThrow('Unauthorized');
    });

    test('throws if order not found', async () => {
      mockOrderModel.findById.mockResolvedValue(null);
      await expect(service.cancelOrder('bad')).rejects.toThrow('Order not found');
    });
  });
});
