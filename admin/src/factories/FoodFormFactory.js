/**
 * FoodRepository — Repository Pattern
 *
 * Owns every food-related API call.
 * Components depend on this abstraction, never on raw HTTP.
 * To swap backends, change only this file.
 */
class FoodRepository {
  #api;

  constructor(apiService) {
    this.#api = apiService;
  }

  /** Fetch all food items. Returns raw array. */
  async getAll() {
    const data = await this.#api.get('/api/food/list');
    if (!data.success) throw new Error('Failed to fetch food list');
    return data.data;
  }

  /** Upload a new food item. @param {FormData} formData */
  async add(formData) {
    const data = await this.#api.postForm('/api/food/add', formData);
    if (!data.success) throw new Error(data.message ?? 'Failed to add food item');
    return data;
  }

  /** Remove a food item by id. */
  async remove(foodId) {
    const data = await this.#api.post('/api/food/remove', { id: foodId });
    if (!data.success) throw new Error(data.message ?? 'Failed to remove food item');
    return data;
  }
}

export default FoodRepository;
