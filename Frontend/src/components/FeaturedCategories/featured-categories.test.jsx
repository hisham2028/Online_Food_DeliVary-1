import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import FeaturedCategories from './featured-categories';

// Mock the assets
vi.mock('../../assets/assets', () => ({
  menu_list: [
    { menu_name: 'Salad', menu_image: '/salad.png' },
    { menu_name: 'Rolls', menu_image: '/rolls.png' },
    { menu_name: 'Deserts', menu_image: '/deserts.png' },
    { menu_name: 'Sandwich', menu_image: '/sandwich.png' },
  ]
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FeaturedCategories Component', () => {
  it('renders the Popular Categories heading', () => {
    renderWithRouter(<FeaturedCategories />);
    expect(screen.getByText('Popular Categories')).toBeInTheDocument();
  });

  it('renders all menu items from the menu_list', () => {
    renderWithRouter(<FeaturedCategories />);
    
    expect(screen.getByText('Salad')).toBeInTheDocument();
    expect(screen.getByText('Rolls')).toBeInTheDocument();
    expect(screen.getByText('Deserts')).toBeInTheDocument();
    expect(screen.getByText('Sandwich')).toBeInTheDocument();
  });

  it('renders images for each category', () => {
    renderWithRouter(<FeaturedCategories />);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    
    expect(images[0]).toHaveAttribute('alt', 'Salad');
    expect(images[1]).toHaveAttribute('alt', 'Rolls');
    expect(images[2]).toHaveAttribute('alt', 'Deserts');
    expect(images[3]).toHaveAttribute('alt', 'Sandwich');
  });

  it('renders links that navigate to /menu', () => {
    renderWithRouter(<FeaturedCategories />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4);
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/menu');
    });
  });

  it('has the correct CSS class on the container', () => {
    const { container } = renderWithRouter(<FeaturedCategories />);
    expect(container.querySelector('.featured-categories')).toBeInTheDocument();
  });

  it('has the correct CSS class on the list container', () => {
    const { container } = renderWithRouter(<FeaturedCategories />);
    expect(container.querySelector('.featured-categories-list')).toBeInTheDocument();
  });

  it('each category item has the correct CSS class', () => {
    const { container } = renderWithRouter(<FeaturedCategories />);
    const categoryItems = container.querySelectorAll('.featured-category-item');
    expect(categoryItems).toHaveLength(4);
  });
});
