import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./components/Navbar/Navbar', () => ({
  default: ({ setShowLogin }) => <div data-testid="navbar">Navbar</div>
}));

vi.mock('./components/Footer/footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./components/Login/login', () => ({
  default: ({ setShowLogin }) => <div data-testid="login">Login</div>
}));

vi.mock('./components/ScrollToTop/ScrollToTop', () => ({
  default: () => null
}));

vi.mock('./components/BackToTop/BackToTop', () => ({
  default: () => null
}));

vi.mock('./pages/Home/home', () => ({
  default: () => <div data-testid="home">Home</div>
}));

vi.mock('./pages/Cart/cart', () => ({
  default: () => <div data-testid="cart">Cart</div>
}));

vi.mock('./pages/Place Order/placeorder', () => ({
  default: () => <div data-testid="placeorder">PlaceOrder</div>
}));

vi.mock('./pages/verify/verify', () => ({
  default: () => <div data-testid="verify">Verify</div>
}));

vi.mock('./pages/myOrders/myorders', () => ({
  default: () => <div data-testid="myorders">MyOrders</div>
}));

vi.mock('./pages/Menu/menu', () => ({
  default: () => <div data-testid="menu">Menu</div>
}));

describe('App Component', () => {
  test('renders Navbar and Footer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('does not show login by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
  });

  test('renders Home page on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  test('renders Cart page on /cart route', () => {
    render(
      <MemoryRouter initialEntries={['/cart']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('cart')).toBeInTheDocument();
  });

  test('renders Menu page on /menu route', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});