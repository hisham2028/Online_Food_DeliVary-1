import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

// Mock IntersectionObserver
let mockObserveInstance = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
const mockIntersectionObserver = vi.fn().mockImplementation(function (_callback) {
  this.observe = mockObserveInstance.observe;
  this.unobserve = mockObserveInstance.unobserve;
  this.disconnect = mockObserveInstance.disconnect;
});
window.IntersectionObserver = mockIntersectionObserver;

describe('SpecialSections Component', () => {
  beforeEach(() => {
    mockObserveInstance = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    mockIntersectionObserver.mockClear();
    mockIntersectionObserver.mockImplementation(function (_callback) {
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
});
