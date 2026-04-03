import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import OurServices from './OurServices';

describe('OurServices Component', () => {
  test('renders services title', () => {
    render(<OurServices />);
    expect(screen.getByText('Our Services')).toBeInTheDocument();
  });

  test('renders services subtitle', () => {
    render(<OurServices />);
    expect(screen.getByText('Exceptional dining tailored to your needs.')).toBeInTheDocument();
  });

  test('renders all three service cards', () => {
    render(<OurServices />);
    expect(screen.getByText('Dine-In Experience')).toBeInTheDocument();
    expect(screen.getByText('Home Delivery')).toBeInTheDocument();
    expect(screen.getByText('Event Catering')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    render(<OurServices />);
    expect(screen.getByText('Luxury atmosphere with top-tier service.')).toBeInTheDocument();
    expect(screen.getByText('Fresh flavors delivered to your doorstep.')).toBeInTheDocument();
    expect(screen.getByText('Professional catering for your special moments.')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    const { container } = render(<OurServices />);
    expect(container.querySelector('.nav-btn.prev')).toBeInTheDocument();
    expect(container.querySelector('.nav-btn.next')).toBeInTheDocument();
  });

  test('clicking next button changes active card', () => {
    const { container } = render(<OurServices />);
    const nextBtn = container.querySelector('.nav-btn.next');
    // Initial active index is 1 (Home Delivery)
    const cardsBefore = container.querySelectorAll('.carousel-card.active');
    expect(cardsBefore.length).toBe(1);

    fireEvent.click(nextBtn);
    const cardsAfter = container.querySelectorAll('.carousel-card.active');
    expect(cardsAfter.length).toBe(1);
  });

  test('clicking prev button changes active card', () => {
    const { container } = render(<OurServices />);
    const prevBtn = container.querySelector('.nav-btn.prev');
    fireEvent.click(prevBtn);
    const activeCards = container.querySelectorAll('.carousel-card.active');
    expect(activeCards.length).toBe(1);
  });

  test('has services-section class', () => {
    const { container } = render(<OurServices />);
    expect(container.querySelector('.services-section')).toBeInTheDocument();
  });
});
