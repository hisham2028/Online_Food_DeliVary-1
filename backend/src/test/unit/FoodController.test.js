/**
 * FoodController unit tests
 * FoodService is fully mocked — no DB required.
 */

// ── mock FoodService before importing the controller ─────────────────────────
const mockAddFood      = jest.fn();
const mockGetAllFoods  = jest.fn();
const mockUpdateFood   = jest.fn();
const mockDeleteFood   = jest.fn();
const mockSearchFoods  = jest.fn();

jest.mock('../services/FoodService.js', () =>
  jest.fn().mockImplementation(() => ({
    addFood:     mockAddFood,
    getAllFoods: mockGetAllFoods,
    updateFood:  mockUpdateFood,
    deleteFood:  mockDeleteFood,
    searchFoods: mockSearchFoods,
  }))
);

import FoodController from '../controllers/FoodController.js';

// ── helpers ───────────────────────────────────────────────────────────────────

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────

describe('FoodController', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── addFood ────────────────────────────────────────────────────────────────

  describe('addFood', () => {
    it('responds 201 with food data on success', async () => {
      const food = { _id: 'f1', name: 'Pizza' };
      mockAddFood.mockResolvedValue(food);

      const req = { body: { name: 'Pizza' }, file: {} };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Food item added successfully',
        data: food,
      });
    });

    it('responds 400 on Mongoose ValidationError', async () => {
      const validationError = {
        name: 'ValidationError',
        errors: { name: { message: 'Name is required' } },
      };
      mockAddFood.mockRejectedValue(validationError);

      const req = { body: {}, file: null };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Validation error' })
      );
    });

    it('responds 500 on unknown server error', async () => {
      mockAddFood.mockRejectedValue(new Error('DB down'));

      const req = { body: {}, file: null };
      const res = mockRes();

      await FoodController.addFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  // ── listFood ───────────────────────────────────────────────────────────────

  describe('listFood', () => {
    it('returns all foods on success', async () => {
      const foods = [{ _id: 'f1' }, { _id: 'f2' }];
      mockGetAllFoods.mockResolvedValue(foods);

      const req = {};
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('responds 500 on error', async () => {
      mockGetAllFoods.mockRejectedValue(new Error('fail'));

      const req = {};
      const res = mockRes();

      await FoodController.listFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── updateFood ─────────────────────────────────────────────────────────────

  describe('updateFood', () => {
    it('responds 200 with updated food on success', async () => {
      const updated = { _id: 'f1', name: 'Burger' };
      mockUpdateFood.mockResolvedValue(updated);

      const req = { params: { id: 'f1' }, body: { name: 'Burger' }, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: updated })
      );
    });

    it('responds 404 when food is not found', async () => {
      mockUpdateFood.mockRejectedValue(new Error('Food item not found'));

      const req = { params: { id: 'bad' }, body: {}, file: null };
      const res = mockRes();

      await FoodController.updateFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Food item not found' });
    });
  });

  // ── removeFood ─────────────────────────────────────────────────────────────

  describe('removeFood', () => {
    it('responds success on valid delete', async () => {
      mockDeleteFood.mockResolvedValue({});

      const req = { body: { id: 'f1' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Food item removed successfully',
      });
    });

    it('responds 400 when id is missing', async () => {
      const req = { body: {} };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Food ID is required' })
      );
    });

    it('responds 404 when food is not found', async () => {
      mockDeleteFood.mockRejectedValue(new Error('Food item not found'));

      const req = { body: { id: 'bad' } };
      const res = mockRes();

      await FoodController.removeFood(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── searchFood ─────────────────────────────────────────────────────────────

  describe('searchFood', () => {
    it('returns matching foods on success', async () => {
      const foods = [{ _id: 'f1', name: 'Pasta' }];
      mockSearchFoods.mockResolvedValue(foods);

      const req = { query: { query: 'pasta' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(mockSearchFoods).toHaveBeenCalledWith('pasta');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: foods });
    });

    it('responds 500 on error', async () => {
      mockSearchFoods.mockRejectedValue(new Error('search failed'));

      const req = { query: { query: 'xyz' } };
      const res = mockRes();

      await FoodController.searchFood(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
