import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './src/App';

vi.mock('./src/components/Navbar/Navbar', () => ({
  default: ({ setShowLogin }) => (
    <div data-testid="navbar">
      <button data-testid="open-login" onClick={() => setShowLogin(true)}>Sign In</button>
    </div>
  )
}));

vi.mock('./src/components/Footer/footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./src/components/Login/login', () => ({
  default: ({ setShowLogin }) => <div data-testid="login">Login</div>
}));

vi.mock('./src/components/ScrollToTop/ScrollToTop', () => ({
  default: () => null
}));

vi.mock('./src/components/BackToTop/BackToTop', () => ({
  default: () => null
}));

vi.mock('./src/pages/Home/home', () => ({
  default: () => <div data-testid="home">Home</div>
}));

vi.mock('./src/pages/Cart/cart', () => ({
  default: () => <div data-testid="cart">Cart</div>
}));

vi.mock('./src/pages/Place Order/placeorder', () => ({
  default: () => <div data-testid="placeorder">PlaceOrder</div>
}));

vi.mock('./src/pages/verify/verify', () => ({
  default: () => <div data-testid="verify">Verify</div>
}));

vi.mock('./src/pages/myOrders/myorders', () => ({
  default: () => <div data-testid="myorders">MyOrders</div>
}));

vi.mock('./src/pages/Menu/menu', () => ({
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

  test('shows Login modal when setShowLogin(true) is called via Navbar', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('login')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('open-login'));
    expect(screen.getByTestId('login')).toBeInTheDocument();
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
