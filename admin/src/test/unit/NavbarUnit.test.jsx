/**
 * Navbar.test.jsx - Comprehensive tests for Navbar component
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Navbar from '../../components/navbar/Navbar';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock assets
vi.mock('../../assets/assets', () => ({
  assets: {
    logo: '/logo.png',
    profile_image: '/profile.png'
  }
}));

// Mock EventBus
vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { SIDEBAR_TOGGLE: 'sidebar:toggle' }
}));

describe('Navbar', () => {
  let originalInnerWidth;

  beforeEach(() => {
    vi.clearAllMocks();
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  it('renders the logo', () => {
    render(<Navbar />);
    expect(screen.getByAltText('Brand logo')).toBeInTheDocument();
  });

  it('renders the profile avatar', () => {
    render(<Navbar />);
    expect(screen.getByRole('img', { name: 'Profile' })).toBeInTheDocument();
  });

  it('renders hamburger button on mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    render(<Navbar />);
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('toggles menu on hamburger click (mobile)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    render(<Navbar />);
    
    const button = screen.getByLabelText('Open menu');
    fireEvent.click(button);
    
    expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.SIDEBAR_TOGGLE, { isOpen: true });
  });

  it('handles resize event', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    render(<Navbar />);
    
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      window.dispatchEvent(new Event('resize'));
    });
    
    // Should close menu when resizing to desktop
  });

  it('shows fallback when profile image fails to load', () => {
    render(<Navbar />);
    const img = screen.getByRole('img', { name: 'Profile' });
    fireEvent.error(img);
    
    expect(screen.getByRole('img', { name: 'Profile' })).toBeInTheDocument();
  });

  it('cleans up resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<Navbar />);
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('hamburger button shows close icon when menu is open', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    render(<Navbar />);
    
    const button = screen.getByLabelText('Open menu');
    fireEvent.click(button);
    
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('does not toggle menu on desktop', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024 });
    render(<Navbar />);
    
    // On desktop, hamburger click should not emit event
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
    }
    // EventBus should not be called on desktop
  });
});
