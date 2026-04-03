/**
 * FoodController unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FoodService from '../../services/FoodService.js';

vi.mock('../../services/FoodService.js', () => ({
  default: vi.fn()
}));

const mockFoodService = {
  addFood: vi.fn(),
  getAllFoods: vi.fn(),
  getFoodById: vi.fn(),
  searchFoods: vi.fn(),
  updateFood: vi.fn(),
  deleteFood: vi.fn()
};

FoodService.mockImplementation(() => mockFoodService);

import FoodController from '../../controllers/FoodController.js';

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
      mockFoodService.addFood.mockResolvedValue(newFood);

      const req = { body: { name: 'Pizza', price: 12.99, category: 'Italian' }, file: { filename: 'pizza.png' } };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food Added', data: newFood });
    });

    it('returns error when required fields missing', async () => {
      mockFoodService.addFood.mockRejectedValue(new Error('Name, price, and image are required'));

      const req = { body: {}, file: null };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Name, price, and image are required' });
    });
  });

  describe('listFood', () => {
    it('returns all food items', async () => {
      const foods = [{ _id: 'food1', name: 'Pizza' }, { _id: 'food2', name: 'Burger' }];
      mockFoodService.getAllFoods.mockResolvedValue(foods);

      const req = { query: {} };
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('filters by category', async () => {
      const foods = [{ _id: 'food1', name: 'Pizza', category: 'Italian' }];
      mockFoodService.getAllFoods.mockResolvedValue(foods);

      const req = { query: { category: 'Italian' } };
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(mockFoodService.getAllFoods).toHaveBeenCalledWith(expect.objectContaining({ category: 'Italian' }));
    });

    it('returns error on failure', async () => {
      mockFoodService.getAllFoods.mockRejectedValue(new Error('Database error'));

      const req = { query: {} };
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Error fetching food list' });
    });
  });

  describe('removeFood', () => {
    it('removes food item successfully', async () => {
      mockFoodService.deleteFood.mockResolvedValue({ message: 'Food item deleted successfully' });

      const req = { body: { id: 'food1' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food Removed' });
    });

    it('returns error when food not found', async () => {
      mockFoodService.deleteFood.mockRejectedValue(new Error('Food item not found'));

      const req = { body: { id: 'invalid' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Food item not found' });
    });
  });

  describe('getFoodById', () => {
    it('returns food item by id', async () => {
      const food = { _id: 'food1', name: 'Pizza', price: 12.99 };
      mockFoodService.getFoodById.mockResolvedValue(food);

      const req = { params: { id: 'food1' } };
      const res = mockRes();

      await FoodController.getFoodById(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: food });
    });

    it('returns 404 when food not found', async () => {
      mockFoodService.getFoodById.mockRejectedValue(new Error('Food item not found'));

      const req = { params: { id: 'invalid' } };
      const res = mockRes();

      await FoodController.getFoodById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('searchFood', () => {
    it('returns search results', async () => {
      const foods = [{ _id: 'food1', name: 'Pizza' }];
      mockFoodService.searchFoods.mockResolvedValue(foods);

      const req = { query: { q: 'pizza' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('returns empty array for no results', async () => {
      mockFoodService.searchFoods.mockResolvedValue([]);

      const req = { query: { q: 'xyz' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });
  });

  describe('updateFood', () => {
    it('updates food item successfully', async () => {
      const updated = { _id: 'food1', name: 'Updated Pizza', price: 15.99 };
      mockFoodService.updateFood.mockResolvedValue(updated);

      const req = { params: { id: 'food1' }, body: { name: 'Updated Pizza', price: 15.99 }, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Food Updated', data: updated });
    });

    it('updates food with new image', async () => {
      const updated = { _id: 'food1', name: 'Pizza', image: 'new-pizza.png' };
      mockFoodService.updateFood.mockResolvedValue(updated);

      const req = { params: { id: 'food1' }, body: {}, file: { filename: 'new-pizza.png' } };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(mockFoodService.updateFood).toHaveBeenCalledWith('food1', {}, { filename: 'new-pizza.png' });
    });

    it('returns error when food not found', async () => {
      mockFoodService.updateFood.mockRejectedValue(new Error('Food item not found'));

      const req = { params: { id: 'invalid' }, body: {}, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Food item not found' });
    });
  });
});
