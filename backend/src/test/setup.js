/**
 * Backend Test Setup
 * Sets environment variables and provides shared test utilities.
 */
import { vi } from 'vitest';

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.MONGODB_URI = 'mongodb://localhost:27017/food-delivery-test';
process.env.PORT = '4001';
