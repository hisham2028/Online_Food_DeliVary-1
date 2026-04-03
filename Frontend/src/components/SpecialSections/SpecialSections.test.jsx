import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpecialSections from './SpecialSections';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: ({ src, ...props }) => <img src={src} {...props} />
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock the assets
vi.mock('../../assets/assets', () => ({
  assets: {
    signature_dishes: '/signature.png',
    seasonal_specials: '/seasonal.png',
    chef_selection: '/chef.png'
  }
}));

// Capture IntersectionObserver callback for testing
let capturedObserverCallback = null;
const mockObserveInstance = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
const mockIntersectionObserver = vi.fn().mockImplementation(function (callback) {
  capturedObserverCallback = callback;
  this.observe = mockObserveInstance.observe;
  this.unobserve = mockObserveInstance.unobserve;
  this.disconnect = mockObserveInstance.disconnect;
});
window.IntersectionObserver = mockIntersectionObserver;

describe('SpecialSections Component', () => {
  beforeEach(() => {
    capturedObserverCallback = null;
    mockObserveInstance.observe.mockClear();
    mockObserveInstance.unobserve.mockClear();
    mockObserveInstance.disconnect.mockClear();
    mockIntersectionObserver.mockClear();
    mockIntersectionObserver.mockImplementation(function (callback) {
      capturedObserverCallback = callback;
      this.observe = mockObserveInstance.observe;
      this.unobserve = mockObserveInstance.unobserve;
      this.disconnect = mockObserveInstance.disconnect;
    });
  });

  it('renders the component wrapper', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.special-sections-wrapper')).toBeInTheDocument();
  });

  it('renders Signature Dishes section', () => {
    render(<SpecialSections />);
    expect(screen.getByText('Signature Dishes')).toBeInTheDocument();
    expect(screen.getByText('Indulge in our world-renowned signature dishes.')).toBeInTheDocument();
  });

  it('renders Seasonal Specials section', () => {
    render(<SpecialSections />);
    expect(screen.getByText('Seasonal Specials')).toBeInTheDocument();
    expect(screen.getByText('Discover the freshest seasonal ingredients.')).toBeInTheDocument();
  });

  it('renders Chef Selection section', () => {
    render(<SpecialSections />);
    expect(screen.getByText("Chef's Selection")).toBeInTheDocument();
    expect(screen.getByText('Let our master chef guide your palate.')).toBeInTheDocument();
  });

  it('renders section indices', () => {
    render(<SpecialSections />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders the background anchor', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.bg-anchor')).toBeInTheDocument();
  });

  it('renders the background layer', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.bg-layer')).toBeInTheDocument();
  });

  it('renders the vignette overlay', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.bg-vignette')).toBeInTheDocument();
  });

  it('renders the main content grid', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.main-content-grid')).toBeInTheDocument();
  });

  it('renders the image sticky side', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.image-sticky-side')).toBeInTheDocument();
  });

  it('renders the text scroll side', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.text-scroll-side')).toBeInTheDocument();
  });

  it('renders scroll blocks for each section', () => {
    const { container } = render(<SpecialSections />);
    const scrollBlocks = container.querySelectorAll('.scroll-block');
    expect(scrollBlocks).toHaveLength(3);
  });

  it('renders an image in the image box', () => {
    const { container } = render(<SpecialSections />);
    expect(container.querySelector('.image-box')).toBeInTheDocument();
    expect(container.querySelector('.active-feature-img')).toBeInTheDocument();
  });

  it('sets up IntersectionObserver on mount', () => {
    render(<SpecialSections />);
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('disconnects IntersectionObserver on unmount', () => {
    const { unmount } = render(<SpecialSections />);
    unmount();
    expect(mockObserveInstance.disconnect).toHaveBeenCalled();
  });

  it('observes all section refs', () => {
    render(<SpecialSections />);
    // Should observe 3 sections
    expect(mockObserveInstance.observe).toHaveBeenCalledTimes(3);
  });

  it('updates activeIndex when a section intersects (covers IntersectionObserver callback)', () => {
    const { container } = render(<SpecialSections />);

    // Collect the observed elements
    const observedElements = mockObserveInstance.observe.mock.calls.map(call => call[0]);
    expect(observedElements).toHaveLength(3);

    // Initially the first block is active
    const scrollBlocks = container.querySelectorAll('.scroll-block');
    expect(scrollBlocks[0]).toHaveClass('active');
    expect(scrollBlocks[1]).not.toHaveClass('active');

    // Simulate the second section becoming visible (wrap in act for React state update)
    act(() => {
      capturedObserverCallback([
        { isIntersecting: true, target: observedElements[1] }
      ]);
    });

    // The second block should now be active
    expect(scrollBlocks[1]).toHaveClass('active');
    expect(scrollBlocks[0]).not.toHaveClass('active');
  });

  it('ignores intersection entries that are not intersecting', () => {
    const { container } = render(<SpecialSections />);

    const observedElements = mockObserveInstance.observe.mock.calls.map(call => call[0]);
    const scrollBlocks = container.querySelectorAll('.scroll-block');

    // Fire callback with isIntersecting=false - should not change activeIndex
    act(() => {
      capturedObserverCallback([
        { isIntersecting: false, target: observedElements[2] }
      ]);
    });

    expect(scrollBlocks[0]).toHaveClass('active'); // still first
  });

  it('ignores intersection entries for untracked elements', () => {
    const { container } = render(<SpecialSections />);

    const scrollBlocks = container.querySelectorAll('.scroll-block');

    // Fire callback with an element not in sectionRefs
    act(() => {
      capturedObserverCallback([
        { isIntersecting: true, target: document.createElement('div') }
      ]);
    });

    expect(scrollBlocks[0]).toHaveClass('active'); // still first
  });
});
