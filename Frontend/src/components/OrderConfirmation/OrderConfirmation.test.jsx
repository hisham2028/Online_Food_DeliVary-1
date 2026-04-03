import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OrderConfirmation from './OrderConfirmation';

describe('OrderConfirmation Component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <OrderConfirmation isOpen={false} onClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
  });

  it('displays the confirmation message', () => {
    render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Your order has been placed successfully. Check your email for details.')).toBeInTheDocument();
  });

  it('renders the Continue Shopping button', () => {
    render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Continue Shopping' })).toBeInTheDocument();
  });

  it('calls onClose when Continue Shopping button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<OrderConfirmation isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Continue Shopping' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders the checkmark SVG', () => {
    const { container } = render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.checkmark')).toBeInTheDocument();
  });

  it('has the modal overlay class', () => {
    const { container } = render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.modal-overlay')).toBeInTheDocument();
  });

  it('has the modal content class', () => {
    const { container } = render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.modal-content')).toBeInTheDocument();
  });

  it('has the checkmark wrapper class', () => {
    const { container } = render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.checkmark-wrapper')).toBeInTheDocument();
  });

  it('has the confirm button class', () => {
    const { container } = render(<OrderConfirmation isOpen={true} onClose={() => {}} />);
    expect(container.querySelector('.confirm-btn')).toBeInTheDocument();
  });
});
