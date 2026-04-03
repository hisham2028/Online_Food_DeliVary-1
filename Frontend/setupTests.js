import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.scrollTo for jsdom
window.scrollTo = vi.fn();

// Mock IntersectionObserver for jsdom
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserverMock;
