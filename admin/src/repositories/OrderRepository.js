/**
 * OrderRepository — Repository Pattern
 *
 * Owns every order-related API call.
 */
class OrderRepository {
  #api;

  constructor(apiService) {
    this.#api = apiService;
  }

  /** Fetch all orders. Returns raw array. */
  async getAll() {
    const data = await this.#api.get('/api/order/list');
    if (!data.success) throw new Error('Failed to fetch orders');
    return data.data;
  }

  /** Update the status of a single order. */
  async updateStatus(orderId, status) {
    const data = await this.#api.post('/api/order/status', { orderId, status });
    if (!data.success) throw new Error('Failed to update order status');
    return data;
  }
}

export default OrderRepository;
