/**
 * ApiService — Singleton Pattern
 *
 * One shared Axios instance for the entire application.
 * All HTTP concerns (base URL, timeout, error normalisation)
 * live here. No other file ever imports axios directly.
 */
import axios from 'axios';

class ApiService {
  static #instance = null;
  #baseUrl = '';
  #client  = null;

  constructor(baseUrl) {
    if (ApiService.#instance) throw new Error('Use ApiService.getInstance()');

    this.#baseUrl = baseUrl;
    this.#client  = axios.create({ baseURL: baseUrl, timeout: 10_000 });

    // Add auth token interceptor
    this.#client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.token = token;
      return config;
    });

    // Normalise every error into a plain Error object
    this.#client.interceptors.response.use(
      (res) => res,
      (err) => {
        const msg = err?.response?.data?.message ?? err.message ?? 'Network error';
        return Promise.reject(new Error(msg));
      }
    );

    ApiService.#instance = this;
  }

  /** Always returns the same instance. */
  static getInstance(baseUrl) {
    if (!ApiService.#instance) new ApiService(baseUrl);
    return ApiService.#instance;
  }

  getBaseUrl() { return this.#baseUrl; }

  async get(endpoint) {
    const res = await this.#client.get(endpoint);
    return res.data;
  }

  async post(endpoint, payload) {
    const res = await this.#client.post(endpoint, payload);
    return res.data;
  }

  async postForm(endpoint, formData) {
    const res = await this.#client.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
}

export default ApiService;
