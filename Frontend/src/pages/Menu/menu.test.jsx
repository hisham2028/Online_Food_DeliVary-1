import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Menu from './menu';

vi.mock('../../components/Explore-menu/explore-menu', () => ({
  default: ({ category, setCategory }) => (
    <div data-testid="explore-menu" data-category={category}>ExploreMenu</div>
  )
}));
vi.mock('../../components/FoodDisplay/FoodDisply', () => ({
  default: ({ category }) => (
    <div data-testid="food-display" data-category={category}>FoodDisplay</div>
  )
}));

describe('Menu Page', () => {
  test('renders ExploreMenu component', () => {
    render(<Menu />);
    expect(screen.getByTestId('explore-menu')).toBeInTheDocument();
  });

  test('renders FoodDisplay component', () => {
    render(<Menu />);
    expect(screen.getByTestId('food-display')).toBeInTheDocument();
  });

  test('passes "All" as default category', () => {
    render(<Menu />);
    expect(screen.getByTestId('explore-menu')).toHaveAttribute('data-category', 'All');
    expect(screen.getByTestId('food-display')).toHaveAttribute('data-category', 'All');
  });

  test('has menu-page class', () => {
    const { container } = render(<Menu />);
    expect(container.querySelector('.menu-page')).toBeInTheDocument();
  });
});
