import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FoodItem from './FoodItem';
import { StoreContext } from '../../context/StoreContext';

const mockContextValue = {
  cartItems: {},
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  url: 'http://localhost:4000'
};

const renderWithContext = (component, contextValue = mockContextValue) => {
  return render(
    <StoreContext.Provider value={contextValue}>
      {component}
    </StoreContext.Provider>
  );
};

describe('FoodItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders food item with correct details', () => {
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />
    );
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Fresh salad')).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  test('displays add button when item not in cart', () => {
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />
    );
    const addButton = screen.getByText('+');
    expect(addButton).toBeInTheDocument();
  });

  test('calls addToCart when add button is clicked', () => {
    const mockAddToCart = vi.fn();
    const context = { ...mockContextValue, addToCart: mockAddToCart };
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />,
      context
    );
    fireEvent.click(screen.getByText('+'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });

  test('displays counter when item is in cart', () => {
    const context = { ...mockContextValue, cartItems: { '1': 2 } };
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />,
      context
    );
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('calls removeFromCart when minus button is clicked', () => {
    const mockRemoveFromCart = vi.fn();
    const context = { ...mockContextValue, cartItems: { '1': 2 }, removeFromCart: mockRemoveFromCart };
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />,
      context
    );
    fireEvent.click(screen.getByText('-'));
    expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
  });

  test('calls addToCart when counter plus button is clicked (quantity > 0)', () => {
    const mockAddToCart = vi.fn();
    const context = { ...mockContextValue, cartItems: { '1': 2 }, addToCart: mockAddToCart };
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />,
      context
    );
    // When quantity > 0, there are two + buttons aren't present; the counter shows - value +
    // Get the + button (counter plus button)
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });

  test('renders image with correct src', () => {
    renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />
    );
    const image = screen.getByAltText('Caesar Salad');
    expect(image).toHaveAttribute('src', 'http://localhost:4000/images/salad.jpg');
  });

  test('renders food item container with correct class', () => {
    const { container } = renderWithContext(
      <FoodItem id="1" name="Caesar Salad" price={12} description="Fresh salad" image="salad.jpg" />
    );
    expect(container.querySelector('.food-item')).toBeInTheDocument();
  });
});
