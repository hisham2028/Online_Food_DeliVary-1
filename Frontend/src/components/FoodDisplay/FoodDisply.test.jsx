import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import FoodDisplay from './FoodDisply';
import { StoreContext } from '../../context/StoreContext';

vi.mock('../Food Item/FoodItem', () => ({
  default: ({ id, name }) => <div data-testid={`food-item-${id}`}>{name}</div>
}));

describe('FoodDisplay Component', () => {
  const mockFoodList = [
    { _id: '1', name: 'Caesar Salad', category: 'Salad', price: 12, image: 'salad.jpg' },
    { _id: '2', name: 'Chicken Roll', category: 'Rolls', price: 10, image: 'roll.jpg' },
    { _id: '3', name: 'Greek Salad', category: 'Salad', price: 11, image: 'greek.jpg' }
  ];

  const renderWithContext = (category, food_list = mockFoodList) => {
    return render(
      <StoreContext.Provider value={{ food_list }}>
        <FoodDisplay category={category} />
      </StoreContext.Provider>
    );
  };

  test('renders component with title', () => {
    // Arrange & Act
    renderWithContext('All');
    
    // Assert
    expect(screen.getByText('Top Selling Items')).toBeInTheDocument();
  });

  test('displays all items when category is "All"', () => {
    // Arrange & Act
    renderWithContext('All');
    
    // Assert
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Chicken Roll')).toBeInTheDocument();
    expect(screen.getByText('Greek Salad')).toBeInTheDocument();
  });

  test('filters items by category', () => {
    // Arrange & Act
    renderWithContext('Salad');
    
    // Assert
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Greek Salad')).toBeInTheDocument();
    expect(screen.queryByText('Chicken Roll')).not.toBeInTheDocument();
  });

  test('displays no items when category has no matches', () => {
    // Arrange & Act
    renderWithContext('Pizza');
    
    // Assert
    expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
    expect(screen.queryByText('Chicken Roll')).not.toBeInTheDocument();
  });

  test('handles empty food list gracefully', () => {
    // Arrange & Act
    renderWithContext('All', []);
    
    // Assert
    expect(screen.getByText('Top Selling Items')).toBeInTheDocument();
    expect(screen.queryByTestId(/food-item/)).not.toBeInTheDocument();
  });

  test('renders FoodItem components with correct props', () => {
    // Arrange & Act
    renderWithContext('All');
    
    // Assert
    expect(screen.getByTestId('food-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('food-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('food-item-3')).toBeInTheDocument();
  });
});
