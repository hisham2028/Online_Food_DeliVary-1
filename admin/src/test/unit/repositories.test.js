/**
 * UNIT TEST — FoodRepository & OrderRepository (Repository Pattern)
 * Tests: getAll, add, remove, updateStatus with mocked ApiService
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FoodRepository from '../../repositories/FoodRepository.js';
import OrderRepository from '../../repositories/OrderRepository.js';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  postForm: vi.fn(),
};

describe('FoodRepository', () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new FoodRepository(mockApi);
  });

  test('getAll() returns food array on success', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ _id: 'f1' }, { _id: 'f2' }] });
    const result = await repo.getAll();
    expect(result).toHaveLength(2);
    expect(mockApi.get).toHaveBeenCalledWith('/api/food/list');
  });

  test('getAll() throws on failure', async () => {
    mockApi.get.mockResolvedValue({ success: false });
    await expect(repo.getAll()).rejects.toThrow('Failed to fetch food list');
  });

  test('add() posts FormData and returns response', async () => {
    const fd = new FormData();
    mockApi.postForm.mockResolvedValue({ success: true, message: 'Added' });
    const result = await repo.add(fd);
    expect(result.success).toBe(true);
    expect(mockApi.postForm).toHaveBeenCalledWith('/api/food/add', fd);
  });

  test('add() throws on failure', async () => {
    mockApi.postForm.mockResolvedValue({ success: false, message: 'Bad data' });
    await expect(repo.add(new FormData())).rejects.toThrow('Bad data');
  });

  test('remove() sends food id and returns response', async () => {
    mockApi.post.mockResolvedValue({ success: true, message: 'Removed' });
    const result = await repo.remove('f1');
    expect(result.success).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith('/api/food/remove', { id: 'f1' });
  });

  test('remove() throws on failure', async () => {
    mockApi.post.mockResolvedValue({ success: false, message: 'Not found' });
    await expect(repo.remove('bad')).rejects.toThrow('Not found');
  });
});

describe('OrderRepository', () => {
  let repo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new OrderRepository(mockApi);
  });

  test('getAll() returns order array on success', async () => {
    mockApi.get.mockResolvedValue({ success: true, data: [{ _id: 'o1' }] });
    const result = await repo.getAll();
    expect(result).toHaveLength(1);
    expect(mockApi.get).toHaveBeenCalledWith('/api/order/list');
  });

  test('getAll() throws on failure', async () => {
    mockApi.get.mockResolvedValue({ success: false });
    await expect(repo.getAll()).rejects.toThrow('Failed to fetch orders');
  });

  test('updateStatus() posts orderId and status', async () => {
    mockApi.post.mockResolvedValue({ success: true });
    const result = await repo.updateStatus('o1', 'Delivered');
    expect(result.success).toBe(true);
    expect(mockApi.post).toHaveBeenCalledWith('/api/order/status', { orderId: 'o1', status: 'Delivered' });
  });

  test('updateStatus() throws on failure', async () => {
    mockApi.post.mockResolvedValue({ success: false });
    await expect(repo.updateStatus('o1', 'Bad')).rejects.toThrow('Failed to update order status');
  });
});
