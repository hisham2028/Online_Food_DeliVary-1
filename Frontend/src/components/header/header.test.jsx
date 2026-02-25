import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Header from './header';

describe('Header Component', () => {
  test('renders header with main heading', () => {
    // Arrange & Act
    render(<Header />);
    
    // Assert
    expect(screen.getByText('Order your favorite food')).toBeInTheDocument();
  });

  test('renders description text', () => {
    // Arrange & Act
    render(<Header />);
    
    // Assert
    expect(screen.getByText(/Munch on the deliciousness/i)).toBeInTheDocument();
  });

  test('renders view menu button', () => {
    // Arrange & Act
    render(<Header />);
    
    // Assert
    const button = screen.getByRole('button', { name: /view menu/i });
    expect(button).toBeInTheDocument();
  });

  test('has correct CSS class structure', () => {
    // Arrange
    const { container } = render(<Header />);
    
    // Assert
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.headercontent')).toBeInTheDocument();
  });
});