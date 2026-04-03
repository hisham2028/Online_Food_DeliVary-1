/**
 * FoodController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../models/FoodModel.js', () => ({
  default: {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    search: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  }
}));

vi.mock('fs/promises', () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));
vi.mock('fs', () => ({ existsSync: vi.fn().mockReturnValue(false) }));

const { default: FoodModel } = await import('../../models/FoodModel.js');
const { default: FoodController } = await import('../../controllers/FoodController.js');

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('FoodController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('addFood', () => {
    it('adds food item successfully', async () => {
      const newFood = { _id: 'food1', name: 'Pizza', price: 12.99 };
      FoodModel.create.mockResolvedValue(newFood);

      const req = { body: { name: 'Pizza', price: '12.99', category: 'Italian' }, file: { filename: 'pizza.png' } };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Food item added successfully',
        data: newFood
      });
    });

    it('returns 400 when required fields missing', async () => {
      const req = { body: {}, file: null };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('handles ValidationError in addFood', async () => {
      const validationError = {
        name: 'ValidationError',
        errors: { price: { message: 'Price must be positive' } }
      };
      FoodModel.create.mockRejectedValue(validationError);

      const req = { body: { name: 'Pizza', price: '-1', category: 'Italian' }, file: { filename: 'pizza.png' } };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error' }));
    });

    it('returns 500 on generic server error in addFood', async () => {
      FoodModel.create.mockRejectedValue(new Error('DB connection lost'));

      const req = { body: { name: 'Pizza', price: '10' }, file: { filename: 'pizza.png' } };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('listFood', () => {
    it('returns all food items', async () => {
      const foods = [{ _id: 'food1', name: 'Pizza' }, { _id: 'food2', name: 'Burger' }];
      FoodModel.findAll.mockResolvedValue(foods);

      const req = { query: {} };
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('returns error on failure', async () => {
      FoodModel.findAll.mockRejectedValue(new Error('Database error'));

      const req = { query: {} };
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('removeFood', () => {
    it('removes food item successfully', async () => {
      FoodModel.findById.mockResolvedValue({ _id: 'food1', image: null });
      FoodModel.deleteById.mockResolvedValue({});

      const req = { body: { id: 'food1' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Food item removed successfully'
      });
    });

    it('returns 400 when id missing', async () => {
      const req = { body: {} };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 404 when food not found', async () => {
      FoodModel.findById.mockResolvedValue(null);

      const req = { body: { id: 'invalid' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 500 on unexpected error in removeFood', async () => {
      FoodModel.findById.mockRejectedValue(new Error('DB error'));

      const req = { body: { id: 'food1' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deletes image file when food has an image and file exists on disk', async () => {
      const { existsSync } = await import('fs');
      const { unlink } = await import('fs/promises');
      existsSync.mockReturnValue(true);
      FoodModel.findById.mockResolvedValue({ _id: 'food1', image: 'pizza.jpg' });
      FoodModel.deleteById.mockResolvedValue({});

      const req = { body: { id: 'food1' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(unlink).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food item removed successfully' });
    });
  });

  describe('searchFood', () => {
    it('returns search results', async () => {
      const foods = [{ _id: 'food1', name: 'Pizza' }];
      FoodModel.search.mockResolvedValue(foods);

      const req = { query: { query: 'pizza' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('returns empty array for no results', async () => {
      FoodModel.search.mockResolvedValue([]);

      const req = { query: { query: 'xyz' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    it('returns 500 on error in searchFood', async () => {
      FoodModel.search.mockRejectedValue(new Error('DB error'));

      const req = { query: { query: 'pizza' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateFood', () => {
    it('updates food item successfully', async () => {
      const updated = { _id: 'food1', name: 'Updated Pizza', price: 15.99 };
      FoodModel.updateById.mockResolvedValue(updated);

      const req = { params: { id: 'food1' }, body: { name: 'Updated Pizza', price: '15.99' }, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Food item updated successfully',
        data: updated
      });
    });

    it('updates image filename when file is provided', async () => {
      const updated = { _id: 'food1', image: 'new.jpg' };
      FoodModel.updateById.mockResolvedValue(updated);

      const req = {
        params: { id: 'food1' },
        body: { name: 'Pizza' },
        file: { filename: 'new.jpg' }
      };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(FoodModel.updateById).toHaveBeenCalledWith(
        'food1',
        expect.objectContaining({ image: 'new.jpg' })
      );
    });

    it('returns 404 when food not found', async () => {
      FoodModel.updateById.mockResolvedValue(null);

      const req = { params: { id: 'invalid' }, body: {}, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('handles ValidationError in updateFood', async () => {
      const validationError = { name: 'ValidationError', errors: { price: { message: 'Price required' } } };
      FoodModel.updateById.mockRejectedValue(validationError);

      const req = { params: { id: 'food1' }, body: {}, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation error' }));
    });

    it('returns 500 on generic error in updateFood', async () => {
      FoodModel.updateById.mockRejectedValue(new Error('DB error'));

      const req = { params: { id: 'food1' }, body: {}, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
