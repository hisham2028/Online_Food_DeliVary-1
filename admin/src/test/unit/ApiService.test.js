/**
 * ApiService.test.js
 * Comprehensive tests for the ApiService singleton
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// We need to reset the singleton before each test
let ApiService;

describe('ApiService', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.mock('axios', () => ({
      default: {
        create: vi.fn(() => ({
          get: vi.fn(),
          post: vi.fn(),
          interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
          }
        }))
      }
    }));
    const module = await import('../../services/ApiService');
    ApiService = module.default;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('getInstance returns an instance', () => {
      const instance = ApiService.getInstance('http://localhost:4002');
      expect(instance).toBeDefined();
    });

    it('getInstance returns the same instance on multiple calls', () => {
      const instance1 = ApiService.getInstance('http://localhost:4002');
      const instance2 = ApiService.getInstance('http://localhost:4002');
      expect(instance1).toBe(instance2);
    });
  });

  describe('getBaseUrl', () => {
    it('returns the configured base URL', () => {
      const instance = ApiService.getInstance('http://localhost:4002');
      expect(instance.getBaseUrl()).toBe('http://localhost:4002');
    });
  });
});
