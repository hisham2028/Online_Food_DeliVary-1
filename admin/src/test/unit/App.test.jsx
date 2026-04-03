/**
 * App.test.jsx
 * Tests: ServiceContext provision, routing, singleton API instance,
 *        useServices hook, route rendering
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App, { useServices, ServiceContext } from './App';
import ApiService from './services/ApiService';

// ── Mocks ──────────────────────────────────────────────────────────────────────
jest.mock('./services/ApiService', () => ({
  __esModule: true,
  default: { getInstance: jest.fn(() => ({ getBaseUrl: () => 'http://localhost:4002' })) },
}));
jest.mock('./repositories/FoodRepository',  () => jest.fn().mockImplementation(() => ({})));
jest.mock('./repositories/OrderRepository', () => jest.fn().mockImplementation(() => ({})));

// Stub heavy page components so routing tests stay focused
jest.mock('./pages/dashboard/Dashboard', () => () => <div>Dashboard Page</div>);
jest.mock('./pages/add/Add',             () => () => <div>Add Page</div>);
jest.mock('./pages/list/List',           () => () => <div>List Page</div>);
jest.mock('./pages/orders/Orders',       () => () => <div>Orders Page</div>);
jest.mock('./components/navbar/Navbar',   () => () => <nav>Navbar</nav>);
jest.mock('./components/sidebar/Sidebar', () => () => <aside>Sidebar</aside>);

jest.mock('react-toastify', () => ({
  ToastContainer: () => null,
}));

// ── Helper ─────────────────────────────────────────────────────────────────────
/**
 * Render App with a specific initial route.
 * Note: App already wraps with routes but not BrowserRouter,
 * so we use MemoryRouter here for testing.
 */
const renderAt = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('App', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('ApiService singleton', () => {
    it('calls ApiService.getInstance exactly once on mount', () => {
      renderAt();
      expect(ApiService.getInstance).toHaveBeenCalledTimes(1);
    });

    it('passes the correct BASE_URL to getInstance', () => {
      renderAt();
      expect(ApiService.getInstance).toHaveBeenCalledWith('http://localhost:4002');
    });

    it('does NOT call getInstance again on re-render', () => {
      const { rerender } = renderAt();
      rerender(
        <MemoryRouter><App /></MemoryRouter>
      );
      expect(ApiService.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe('ServiceContext', () => {
    it('provides services to consumers via useServices()', () => {
      let capturedServices;
      const Consumer = () => {
        capturedServices = useServices();
        return null;
      };
      render(
        <ServiceContext.Provider value={{ api: 'apiMock', foodRepo: 'foodMock', orderRepo: 'orderMock' }}>
          <Consumer />
        </ServiceContext.Provider>
      );
      expect(capturedServices.api).toBe('apiMock');
      expect(capturedServices.foodRepo).toBe('foodMock');
      expect(capturedServices.orderRepo).toBe('orderMock');
    });

    it('useServices throws when used outside App provider', () => {
      const Consumer = () => { useServices(); return null; };
      expect(() => render(<Consumer />)).toThrow('useServices must be used inside <App />');
    });
  });

  describe('Routing', () => {
    it('renders Dashboard at "/"', () => {
      renderAt('/');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders Dashboard at "/dashboard"', () => {
      renderAt('/dashboard');
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders Add page at "/add"', () => {
      renderAt('/add');
      expect(screen.getByText('Add Page')).toBeInTheDocument();
    });

    it('renders List page at "/list"', () => {
      renderAt('/list');
      expect(screen.getByText('List Page')).toBeInTheDocument();
    });

    it('renders Orders page at "/orders"', () => {
      renderAt('/orders');
      expect(screen.getByText('Orders Page')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('always renders Navbar', () => {
      renderAt();
      expect(screen.getByText('Navbar')).toBeInTheDocument();
    });

    it('always renders Sidebar', () => {
      renderAt();
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
    });
  });
});
