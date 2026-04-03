import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Home from './home';

vi.mock('../../components/header/header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('../../components/FeaturedCategories/featured-categories', () => ({
  default: () => <div data-testid="featured-categories">FeaturedCategories</div>
}));
vi.mock('../../components/SpecialSections/SpecialSections', () => ({
  default: () => <div data-testid="special-sections">SpecialSections</div>
}));
vi.mock('../../components/OurServices/OurServices', () => ({
  default: () => <div data-testid="our-services">OurServices</div>
}));
vi.mock('../../components/AppDownload/AppDownload', () => ({
  default: () => <div data-testid="app-download">AppDownload</div>
}));

describe('Home Page', () => {
  test('renders Header component', () => {
    render(<Home />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('renders FeaturedCategories component', () => {
    render(<Home />);
    expect(screen.getByTestId('featured-categories')).toBeInTheDocument();
  });

  test('renders SpecialSections component', () => {
    render(<Home />);
    expect(screen.getByTestId('special-sections')).toBeInTheDocument();
  });

  test('renders OurServices component', () => {
    render(<Home />);
    expect(screen.getByTestId('our-services')).toBeInTheDocument();
  });

  test('renders AppDownload component', () => {
    render(<Home />);
    expect(screen.getByTestId('app-download')).toBeInTheDocument();
  });

  test('has OurServices section with correct id', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('#OurServices')).toBeInTheDocument();
  });

  test('has top id on root element', () => {
    const { container } = render(<Home />);
    expect(container.querySelector('#top')).toBeInTheDocument();
  });
});
