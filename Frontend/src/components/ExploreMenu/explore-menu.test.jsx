import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ExploreMenu from './explore-menu';

// The component uses menu_list.concat(menu_list) for infinite scroll effect,
// so all items appear twice. We must use getAllBy* queries.

describe('ExploreMenu Component', () => {
  const mockSetCategory = vi.fn();

  const renderComponent = (category = 'All') => {
    return render(<ExploreMenu category={category} setCategory={mockSetCategory} />);
  };

  test('renders component with title', () => {
    renderComponent();
    expect(screen.getByText('Popular Categories')).toBeInTheDocument();
  });

  test('renders all menu items (doubled for scroll effect)', () => {
    renderComponent();
    const salads = screen.getAllByText('Salad');
    expect(salads.length).toBe(2); // doubled
    const rolls = screen.getAllByText('Rolls');
    expect(rolls.length).toBe(2);
  });

  test('applies active class to selected category images', () => {
    renderComponent('Salad');
    const saladImages = screen.getAllByAltText('Salad');
    saladImages.forEach((img) => {
      expect(img).toHaveClass('active');
    });
  });

  test('non-selected categories do not have active class', () => {
    renderComponent('Salad');
    const rollsImages = screen.getAllByAltText('Rolls');
    rollsImages.forEach((img) => {
      expect(img).not.toHaveClass('active');
    });
  });

  test('calls setCategory when menu item is clicked', () => {
    renderComponent();
    const saladItems = screen.getAllByText('Salad');
    fireEvent.click(saladItems[0].closest('.explore-menu-list-item'));
    expect(mockSetCategory).toHaveBeenCalled();
  });

  test('renders images with correct alt attributes', () => {
    renderComponent();
    const saladImages = screen.getAllByAltText('Salad');
    expect(saladImages.length).toBeGreaterThanOrEqual(1);
    expect(saladImages[0]).toHaveAttribute('src');
  });

  test('renders horizontal rule after menu list', () => {
    const { container } = renderComponent();
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  test('has explore-menu id for navigation', () => {
    const { container } = renderComponent();
    expect(container.querySelector('#explore-menu')).toBeInTheDocument();
  });
});