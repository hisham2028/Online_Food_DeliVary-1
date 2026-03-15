import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Footer from './footer';

describe('Footer Component', () => {
  test('renders footer with company name', () => {
    render(<Footer />);
    expect(screen.getByText('Crave Yard')).toBeInTheDocument();
  });

  test('renders company description', () => {
    render(<Footer />);
    expect(screen.getByText(/Delicious meals delivered/i)).toBeInTheDocument();
  });

  test('renders Contact Us section with details', () => {
    render(<Footer />);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText(/info@craveyard\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\(123\) 456-7890/i)).toBeInTheDocument();
    expect(screen.getByText(/123 Food Street/i)).toBeInTheDocument();
  });

  test('renders social media icons', () => {
    render(<Footer />);
    expect(screen.getByAltText('Facebook')).toBeInTheDocument();
    expect(screen.getByAltText('Twitter')).toBeInTheDocument();
    expect(screen.getByAltText('Instagram')).toBeInTheDocument();
  });

  test('renders current year in copyright', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  test('renders copyright with Crave Yard', () => {
    render(<Footer />);
    expect(screen.getByText(/Crave Yard\. All rights reserved/i)).toBeInTheDocument();
  });

  test('has footer id for navigation', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('#footer');
    expect(footer).toBeInTheDocument();
  });

  test('renders map iframe', () => {
    render(<Footer />);
    const iframe = screen.getByTitle('Restaurant Location');
    expect(iframe).toBeInTheDocument();
  });

  test('has correct footer class', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.footer')).toBeInTheDocument();
  });
});
