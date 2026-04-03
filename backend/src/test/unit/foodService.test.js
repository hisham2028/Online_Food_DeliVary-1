/**
 * UNIT TEST — FoodService
 * Tests: addFood, getAllFoods, getFoodById, searchFoods, updateFood, deleteFood
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FoodService from '../../services/FoodService.js';

// Mock fs operations
vi.mock('fs/promises', () => ({
  unlink: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

const mockFoodModel = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  search: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('FoodService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FoodService(mockFoodModel);
  });

  // ─── addFood ────────────────────────────────────────────────
  describe('addFood()', () => {
    test('creates food item with correct data', async () => {
      const foodData = { name: 'Pizza', price: '12.99', description: 'Cheesy', category: 'Pizza' };
      const imageFile = { filename: 'pizza.jpg' };
      mockFoodModel.create.mockResolvedValue({ _id: 'f1', ...foodData, image: 'pizza.jpg' });

      const result = await service.addFood(foodData, imageFile);

      expect(mockFoodModel.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Pizza',
        price: 12.99,
        image: 'pizza.jpg',
      }));
      expect(result._id).toBe('f1');
    });

    test('throws if name is missing', async () => {
      await expect(service.addFood({ price: '10' }, { filename: 'a.jpg' }))
        .rejects.toThrow('required');
    });

    test('throws if price is missing', async () => {
      await expect(service.addFood({ name: 'Burger' }, { filename: 'a.jpg' }))
        .rejects.toThrow('required');
    });

    test('throws if image file is missing', async () => {
      await expect(service.addFood({ name: 'Burger', price: '10' }, null))
        .rejects.toThrow('required');
    });
  });

  // ─── getAllFoods ────────────────────────────────────────────
  describe('getAllFoods()', () => {
    test('returns all foods with no filter', async () => {
      const foods = [{ _id: 'f1' }, { _id: 'f2' }];
      mockFoodModel.findAll.mockResolvedValue(foods);

      const result = await service.getAllFoods();
      expect(result).toEqual(foods);
    });

    test('passes category filter to model', async () => {
      mockFoodModel.findAll.mockResolvedValue([]);
      await service.getAllFoods({ category: 'Salad' });
      expect(mockFoodModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Salad' }),
        expect.any(Object)
      );
    });
  });

  // ─── getFoodById ────────────────────────────────────────────
  describe('getFoodById()', () => {
    test('returns food if found', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', name: 'Salad' });
      const result = await service.getFoodById('f1');
      expect(result.name).toBe('Salad');
    });

    test('throws if food not found', async () => {
      mockFoodModel.findById.mockResolvedValue(null);
      await expect(service.getFoodById('bad')).rejects.toThrow('Food item not found');
    });
  });

  // ─── searchFoods ────────────────────────────────────────────
  describe('searchFoods()', () => {
    test('returns matching foods', async () => {
      mockFoodModel.search.mockResolvedValue([{ _id: 'f1', name: 'Caesar Salad' }]);
      const result = await service.searchFoods('salad');
      expect(result).toHaveLength(1);
    });

    test('returns empty array for empty search term', async () => {
      const result = await service.searchFoods('');
      expect(result).toEqual([]);
    });

    test('returns empty array for null search term', async () => {
      const result = await service.searchFoods(null);
      expect(result).toEqual([]);
    });
  });

  // ─── updateFood ─────────────────────────────────────────────
  describe('updateFood()', () => {
    test('updates food without new image', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', image: 'old.jpg' });
      mockFoodModel.update.mockResolvedValue({ _id: 'f1', name: 'Updated' });

      const result = await service.updateFood('f1', { name: 'Updated' }, null);
      expect(result.name).toBe('Updated');
    });

    test('replaces image when new image provided', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', image: 'old.jpg' });
      mockFoodModel.update.mockResolvedValue({ _id: 'f1', image: 'new.jpg' });

      await service.updateFood('f1', {}, { filename: 'new.jpg' });
      expect(mockFoodModel.update).toHaveBeenCalledWith('f1', expect.objectContaining({ image: 'new.jpg' }));
    });

    test('throws if food not found', async () => {
      mockFoodModel.findById.mockResolvedValue(null);
      await expect(service.updateFood('bad', {}, null)).rejects.toThrow('Food item not found');
    });
  });

  // ─── deleteFood ─────────────────────────────────────────────
  describe('deleteFood()', () => {
    test('deletes food and its image', async () => {
      mockFoodModel.findById.mockResolvedValue({ _id: 'f1', image: 'pizza.jpg' });
      mockFoodModel.delete.mockResolvedValue({});

      const result = await service.deleteFood('f1');
      expect(mockFoodModel.delete).toHaveBeenCalledWith('f1');
      expect(result.message).toContain('deleted');
    });

    test('throws if food not found', async () => {
      mockFoodModel.findById.mockResolvedValue(null);
      await expect(service.deleteFood('bad')).rejects.toThrow('Food item not found');
    });
  });
});
