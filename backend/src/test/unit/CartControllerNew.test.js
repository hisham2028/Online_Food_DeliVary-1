/**
 * CartController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartService from '../../services/CartService.js';

vi.mock('../../services/CartService.js', () => ({
  default: vi.fn()
}));

const mockCartService = {
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  getCart: vi.fn(),
  clearCart: vi.fn()
};

CartService.mockImplementation(() => mockCartService);

import CartController from '../../controllers/CartController.js';

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('CartController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('addToCart', () => {
    it('adds item to cart successfully', async () => {
      mockCartService.addToCart.mockResolvedValue({ message: 'Added to cart', cartData: { item1: 1 } });

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Added to cart', cartData: { item1: 1 } });
    });

    it('returns error when food item not found', async () => {
      mockCartService.addToCart.mockRejectedValue(new Error('Food item not found'));

      const req = { body: { userId: 'user1', itemId: 'invalid' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Food item not found' });
    });

    it('returns error when food item not available', async () => {
      mockCartService.addToCart.mockRejectedValue(new Error('Food item not available'));

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Food item not available' });
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      mockCartService.removeFromCart.mockResolvedValue({ message: 'Removed from cart', cartData: {} });

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Removed from cart', cartData: {} });
    });

    it('returns error when item not in cart', async () => {
      mockCartService.removeFromCart.mockRejectedValue(new Error('Item not in cart'));

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Item not in cart' });
    });
  });

  describe('getCart', () => {
    it('returns cart data successfully', async () => {
      mockCartService.getCart.mockResolvedValue({ cartData: { item1: 2, item2: 1 } });

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, cartData: { item1: 2, item2: 1 } });
    });

    it('returns error when user not found', async () => {
      mockCartService.getCart.mockRejectedValue(new Error('User not found'));

      const req = { body: { userId: 'invalid' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  describe('clearCart', () => {
    it('clears cart successfully', async () => {
      mockCartService.clearCart.mockResolvedValue({ message: 'Cart cleared', cartData: {} });

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cart cleared', cartData: {} });
    });

    it('returns error on failure', async () => {
      mockCartService.clearCart.mockRejectedValue(new Error('Failed to clear cart'));

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Failed to clear cart' });
    });
  });
});
