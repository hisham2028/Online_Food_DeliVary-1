/**
 * CartController unit tests
 */

const mockAddToCart      = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockGetCart        = jest.fn();
const mockClearCart      = jest.fn();

jest.mock('../services/CartService.js', () =>
  jest.fn().mockImplementation(() => ({
    addToCart:      mockAddToCart,
    removeFromCart: mockRemoveFromCart,
    getCart:        mockGetCart,
    clearCart:      mockClearCart,
  }))
);

import CartController from '../controllers/CartController.js';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('CartController', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── addToCart ──────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('adds item and returns success message', async () => {
      mockAddToCart.mockResolvedValue({ message: 'Item added to cart' });

      const req = { body: { userId: 'u1', itemId: 'food1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(mockAddToCart).toHaveBeenCalledWith('u1', 'food1');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Item added to cart' });
    });

    it('returns error on failure', async () => {
      mockAddToCart.mockRejectedValue(new Error('Item not found'));

      const req = { body: { userId: 'u1', itemId: 'bad' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Item not found' });
    });

    it('returns fallback message when error has no message', async () => {
      mockAddToCart.mockRejectedValue(new Error());

      const req = { body: { userId: 'u1', itemId: 'f1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error adding to cart' });
    });
  });

  // ── removeFromCart ─────────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('removes item and returns success message', async () => {
      mockRemoveFromCart.mockResolvedValue({ message: 'Item removed from cart' });

      const req = { body: { userId: 'u1', itemId: 'food1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(mockRemoveFromCart).toHaveBeenCalledWith('u1', 'food1');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Item removed from cart' });
    });

    it('returns error on failure', async () => {
      mockRemoveFromCart.mockRejectedValue(new Error('Cart error'));

      const req = { body: { userId: 'u1', itemId: 'f1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cart error' });
    });
  });

  // ── getCart ────────────────────────────────────────────────────────────────

  describe('getCart', () => {
    it('returns cartData for the user', async () => {
      const cartData = { food1: 2, food2: 1 };
      mockGetCart.mockResolvedValue({ cartData });

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(mockGetCart).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith({ success: true, cartData });
    });

    it('returns error when cart fetch fails', async () => {
      mockGetCart.mockRejectedValue(new Error('User not found'));

      const req = { body: { userId: 'bad' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  // ── clearCart ──────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('clears cart and returns success message', async () => {
      mockClearCart.mockResolvedValue({ message: 'Cart cleared' });

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(mockClearCart).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cart cleared' });
    });

    it('returns error on failure', async () => {
      mockClearCart.mockRejectedValue(new Error('Clear failed'));

      const req = { body: { userId: 'u1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Clear failed' });
    });
  });
});
