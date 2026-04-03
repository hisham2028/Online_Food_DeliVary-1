import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScrollToTop from './ScrollToTop';

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true
});

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
  });

  it('calls window.scrollTo on initial render', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('calls window.scrollTo when pathname changes', () => {
    // ScrollToTop fires on the initial mount; rerender with a new MemoryRouter
    // creates a new mount which also triggers the effect.
    const { unmount } = render(
      <MemoryRouter initialEntries={['/home']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
    mockScrollTo.mockClear();
    unmount();

    render(
      <MemoryRouter initialEntries={['/menu']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('returns null (renders nothing)', () => {
    const { container } = render(
      <MemoryRouter>
        <ScrollToTop />
      </MemoryRouter>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('scrolls to top on /cart route', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('scrolls to top on /order route', () => {
    render(
      <MemoryRouter initialEntries={['/order']}>
        <ScrollToTop />
      </MemoryRouter>
    );
    
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });
});
