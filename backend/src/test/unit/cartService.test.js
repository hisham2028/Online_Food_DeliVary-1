/**
 * UNIT TEST — CartService
 * Tests: addToCart, removeFromCart, getCart, clearCart with mocked models
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CartService from '../../services/CartService.js';

const mockUserModel = {
  findById: vi.fn(),
  updateCart: vi.fn(),
  clearCart: vi.fn(),
};

const mockFoodModel = {
  findById: vi.fn(),
};

describe('CartService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CartService(mockUserModel, mockFoodModel);
  });

  // ─── addToCart ──────────────────────────────────────────────
  describe('addToCart()', () => {
    test('throws if food item not found', async () => {
      mockFoodModel.findById.mockResolvedValue(null);
      await expect(service.addToCart('u1', 'badFoodId')).rejects.toThrow('Food item not found');
    });

    test('throws if food item is unavailable', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: false });
      await expect(service.addToCart('u1', 'f1')).rejects.toThrow('Food item not available');
    });

    test('throws if user not found', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: true });
      mockUserModel.findById.mockResolvedValue(null);
      await expect(service.addToCart('badUser', 'f1')).rejects.toThrow('User not found');
    });

    test('adds new item with quantity 1', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: true });
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: {} });
      mockUserModel.updateCart.mockResolvedValue({});

      const result = await service.addToCart('u1', 'f1');

      expect(result.cartData.f1).toBe(1);
      expect(mockUserModel.updateCart).toHaveBeenCalledWith('u1', { f1: 1 });
    });

    test('increments quantity if item already in cart', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', isAvailable: true });
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { f1: 2 } });
      mockUserModel.updateCart.mockResolvedValue({});

      const result = await service.addToCart('u1', 'f1');

      expect(result.cartData.f1).toBe(3);
    });
  });

  // ─── removeFromCart ─────────────────────────────────────────
  describe('removeFromCart()', () => {
    test('throws if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      await expect(service.removeFromCart('badUser', 'f1')).rejects.toThrow('User not found');
    });

    test('throws if item not in cart', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: {} });
      await expect(service.removeFromCart('u1', 'f1')).rejects.toThrow('Item not in cart');
    });

    test('decrements quantity', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { f1: 3 } });
      mockUserModel.updateCart.mockResolvedValue({});

      const result = await service.removeFromCart('u1', 'f1');

      expect(result.cartData.f1).toBe(2);
    });

    test('removes item entirely when quantity reaches 0', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { f1: 1 } });
      mockUserModel.updateCart.mockResolvedValue({});

      const result = await service.removeFromCart('u1', 'f1');

      expect(result.cartData.f1).toBeUndefined();
    });
  });

  // ─── getCart ────────────────────────────────────────────────
  describe('getCart()', () => {
    test('throws if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      await expect(service.getCart('badUser')).rejects.toThrow('User not found');
    });

    test('returns cart data', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: { f1: 2, f2: 1 } });
      const result = await service.getCart('u1');
      expect(result.cartData).toEqual({ f1: 2, f2: 1 });
    });

    test('returns empty object if cart is undefined', async () => {
      mockUserModel.findById.mockResolvedValue({ _id: 'u1', cartData: undefined });
      const result = await service.getCart('u1');
      expect(result.cartData).toEqual({});
    });
  });

  // ─── clearCart ──────────────────────────────────────────────
  describe('clearCart()', () => {
    test('clears cart and returns empty object', async () => {
      mockUserModel.clearCart.mockResolvedValue({});
      const result = await service.clearCart('u1');
      expect(result.cartData).toEqual({});
      expect(mockUserModel.clearCart).toHaveBeenCalledWith('u1');
    });
  });
});
