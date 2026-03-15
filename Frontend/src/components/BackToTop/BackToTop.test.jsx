import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import BackToTop from './BackToTop';

describe('BackToTop Component', () => {
  test('does not render button when page is at top', () => {
    render(<BackToTop />);
    expect(screen.queryByLabelText('Back to top')).not.toBeInTheDocument();
  });

  test('renders button when page is scrolled down', () => {
    render(<BackToTop />);
    Object.defineProperty(window, 'pageYOffset', { value: 500, writable: true });
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Back to top')).toBeInTheDocument();
  });

  test('hides button when scrolled back to top', () => {
    render(<BackToTop />);
    Object.defineProperty(window, 'pageYOffset', { value: 500, writable: true });
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Back to top')).toBeInTheDocument();

    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    fireEvent.scroll(window);
    expect(screen.queryByLabelText('Back to top')).not.toBeInTheDocument();
  });

  test('calls window.scrollTo when button is clicked', () => {
    render(<BackToTop />);
    Object.defineProperty(window, 'pageYOffset', { value: 500, writable: true });
    fireEvent.scroll(window);

    fireEvent.click(screen.getByLabelText('Back to top'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  test('button has correct class name', () => {
    render(<BackToTop />);
    Object.defineProperty(window, 'pageYOffset', { value: 500, writable: true });
    fireEvent.scroll(window);
    expect(screen.getByLabelText('Back to top')).toHaveClass('back-to-top');
  });
});
