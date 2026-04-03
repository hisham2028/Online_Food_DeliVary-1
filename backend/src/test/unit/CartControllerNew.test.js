/**
 * CartController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/UserModel.js', () => ({
  default: {
    findById: vi.fn(),
    updateById: vi.fn(),
  }
}));

const { default: UserModel } = await import('../../models/UserModel.js');
const { default: CartController } = await import('../../controllers/CartController.js');

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
      UserModel.findById.mockResolvedValue({ _id: 'user1', cartData: {} });
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Added To Cart' });
    });

    it('increments quantity for existing item', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'user1', cartData: { item1: 2 } });
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(UserModel.updateById).toHaveBeenCalledWith('user1', { cartData: { item1: 3 } });
    });

    it('returns error when user not found', async () => {
      UserModel.findById.mockResolvedValue(null);

      const req = { body: { userId: 'invalid', itemId: 'item1' } };
      const res = mockRes();

      await CartController.addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  describe('removeFromCart', () => {
    it('removes item from cart successfully', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'user1', cartData: { item1: 2 } });
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'user1', itemId: 'item1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Removed From Cart' });
    });

    it('returns error when user not found', async () => {
      UserModel.findById.mockResolvedValue(null);

      const req = { body: { userId: 'invalid', itemId: 'item1' } };
      const res = mockRes();

      await CartController.removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  describe('getCart', () => {
    it('returns cart data successfully', async () => {
      UserModel.findById.mockResolvedValue({ _id: 'user1', cartData: { item1: 2, item2: 1 } });

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, cartData: { item1: 2, item2: 1 } });
    });

    it('returns error when user not found', async () => {
      UserModel.findById.mockResolvedValue(null);

      const req = { body: { userId: 'invalid' } };
      const res = mockRes();

      await CartController.getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  describe('clearCart', () => {
    it('clears cart successfully', async () => {
      UserModel.updateById.mockResolvedValue({});

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(UserModel.updateById).toHaveBeenCalledWith('user1', { cartData: {} });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cart cleared' });
    });

    it('returns error on failure', async () => {
      UserModel.updateById.mockRejectedValue(new Error('DB error'));

      const req = { body: { userId: 'user1' } };
      const res = mockRes();

      await CartController.clearCart(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
