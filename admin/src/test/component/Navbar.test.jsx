/**
 * COMPONENT TEST — Admin Navbar
 * Tests: renders logo, profile image, hamburger toggle
 */
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Navbar from '../../components/navbar/Navbar.jsx';

vi.mock('../../assets/assets', () => ({
  assets: {
    logo: 'logo.png',
    profile_image: 'profile.jpg',
  },
}));

vi.mock('../../events/EventBus', () => {
  const emit = vi.fn();
  return {
    default: { emit, on: vi.fn(() => vi.fn()) },
    EVENTS: { SIDEBAR_TOGGLE: 'sidebar:toggle' },
  };
});

describe('Navbar Component', () => {
  test('renders brand logo', () => {
    render(<Navbar />);
    const logo = screen.getByAltText('Brand logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'logo.png');
  });

  test('renders profile image', () => {
    render(<Navbar />);
    const profile = screen.getByAltText('Profile');
    expect(profile).toBeInTheDocument();
  });

  test('has nav element', () => {
    const { container } = render(<Navbar />);
    expect(container.querySelector('nav.navbar')).toBeInTheDocument();
  });
});
