import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Verify from './verify';

describe('Verify Component', () => {
  test('renders verify payment text', () => {
    render(<Verify />);
    expect(screen.getByText('Verify Payment')).toBeInTheDocument();
  });

  test('renders with correct class', () => {
    const { container } = render(<Verify />);
    expect(container.querySelector('.verify')).toBeInTheDocument();
  });
});
