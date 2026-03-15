/**
 * INTEGRATION TEST — Food API Routes
 * Tests: POST /api/food/add, GET /api/food/list, POST /api/food/remove
 * Uses supertest against the real Express app with mocked DB layer.
 */
import { describe, test, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock the models and services before importing routes
vi.mock('../../models/FoodModel.js', () => {
  return {
    default: {
      create: vi.fn().mockResolvedValue({
        _id: 'f1', name: 'Test Pizza', price: 12.99,
        category: 'Pizza', image: 'test.jpg', description: 'Tasty',
      }),
      findAll: vi.fn().mockResolvedValue([
        { _id: 'f1', name: 'Pizza', price: 12, category: 'Pizza', image: 'pizza.jpg' },
        { _id: 'f2', name: 'Salad', price: 8, category: 'Salad', image: 'salad.jpg' },
      ]),
      findById: vi.fn().mockResolvedValue({ _id: 'f1', name: 'Pizza', image: 'pizza.jpg' }),
      deleteById: vi.fn().mockResolvedValue({}),
      search: vi.fn().mockResolvedValue([{ _id: 'f1', name: 'Pizza' }]),
      updateById: vi.fn().mockResolvedValue({ _id: 'f1', name: 'Updated' }),
    },
  };
});

vi.mock('../../middleware/FileUploadMiddleware.js', () => ({
  default: {
    upload: () => (req, _res, next) => {
      req.file = { filename: 'mock-image.jpg' };
      next();
    },
  },
}));

vi.mock('fs/promises', () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));
vi.mock('fs', () => ({ existsSync: vi.fn().mockReturnValue(false) }));

// Dynamic import after mocks are set
const { default: FoodController } = await import('../../controllers/FoodController.js');

let app;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.post('/api/food/add', (_req, _res, next) => { _req.file = { filename: 'mock.jpg' }; next(); }, FoodController.addFood);
  app.get('/api/food/list', FoodController.listFood);
  app.post('/api/food/remove', FoodController.removeFood);
  app.get('/api/food/search', FoodController.searchFood);
});

describe('Food API — Integration', () => {
  test('GET /api/food/list returns list of foods', async () => {
    const res = await request(app).get('/api/food/list');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Pizza');
  });

  test('POST /api/food/add creates a food item', async () => {
    const res = await request(app)
      .post('/api/food/add')
      .send({ name: 'Test Pizza', price: '12.99', category: 'Pizza', description: 'Tasty' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Pizza');
  });

  test('POST /api/food/remove deletes a food item', async () => {
    const res = await request(app)
      .post('/api/food/remove')
      .send({ id: 'f1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/food/remove returns 400 without id', async () => {
    const res = await request(app)
      .post('/api/food/remove')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/food/search returns matching results', async () => {
    const res = await request(app).get('/api/food/search?query=Pizza');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
