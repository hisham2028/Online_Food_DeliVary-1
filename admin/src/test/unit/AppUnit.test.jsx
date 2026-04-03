/**
 * AppUnit.test.jsx - Comprehensive tests for App component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App, { useServices, ServiceContext } from '../../App';

// Mock all dependencies
vi.mock('../../services/ApiService', () => ({
  default: { 
    getInstance: vi.fn(() => ({ 
      getBaseUrl: () => 'http://localhost:4002',
      get: vi.fn(),
      post: vi.fn(),
      postForm: vi.fn()
    })) 
  }
}));

vi.mock('../../repositories/FoodRepository', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockResolvedValue([]),
    add: vi.fn(),
    remove: vi.fn()
  }))
}));

vi.mock('../../repositories/OrderRepository', () => ({
  default: vi.fn().mockImplementation(() => ({
    getAll: vi.fn().mockResolvedValue([]),
    updateStatus: vi.fn()
  }))
}));

vi.mock('../../pages/dashboard/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../../pages/add/Add', () => ({ default: () => <div>Add Page</div> }));
vi.mock('../../pages/list/List', () => ({ default: () => <div>List Page</div> }));
vi.mock('../../pages/orders/Orders', () => ({ default: () => <div>Orders Page</div> }));
vi.mock('../../components/navbar/Navbar', () => ({ default: () => <nav>Navbar</nav> }));
vi.mock('../../components/sidebar/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));
vi.mock('react-toastify', () => ({ ToastContainer: () => null }));

const renderAt = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  beforeEach(() => vi.clearAllMocks());

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
});
