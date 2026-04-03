import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Header from './header';

const renderHeader = () => render(<BrowserRouter><Header /></BrowserRouter>);

describe('Header Component', () => {
  test('renders header with main heading', () => {
    renderHeader();
    expect(screen.getByText(/Order your/i)).toBeInTheDocument();
    expect(screen.getByText(/favorite food/i)).toBeInTheDocument();
  });

  test('renders description text', () => {
    renderHeader();
    expect(screen.getByText(/Crafted with the finest ingredients/i)).toBeInTheDocument();
  });

  test('renders view menu button', () => {
    renderHeader();
    const button = screen.getByRole('button', { name: /view menu/i });
    expect(button).toBeInTheDocument();
  });

  test('has correct CSS class structure', () => {
    const { container } = renderHeader();
    expect(container.querySelector('.header')).toBeInTheDocument();
    expect(container.querySelector('.headercontent')).toBeInTheDocument();
  });
});