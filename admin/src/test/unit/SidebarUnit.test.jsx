/**
 * SidebarUnit.test.jsx - Comprehensive tests for Sidebar component
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../../components/sidebar/Sidebar';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock assets
vi.mock('../../assets/assets', () => ({
  assets: {
    dashboard_icon: '/dashboard.png',
    add_icon: '/add.png',
    order_icon: '/order.png'
  }
}));

// Mock EventBus
let eventCallback;
vi.mock('../../events/EventBus', () => ({
  default: {
    emit: vi.fn(),
    on: vi.fn((event, callback) => {
      eventCallback = callback;
      return vi.fn(); // unsubscribe function
    })
  },
  EVENTS: { SIDEBAR_TOGGLE: 'sidebar:toggle' }
}));

const renderSidebar = () => {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventCallback = null;
  });

  it('renders all navigation links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Items')).toBeInTheDocument();
    expect(screen.getByText('List Items')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('subscribes to SIDEBAR_TOGGLE event on mount', () => {
    renderSidebar();
    expect(EventBus.on).toHaveBeenCalledWith(EVENTS.SIDEBAR_TOGGLE, expect.any(Function));
  });

  it('opens sidebar when receiving toggle event with isOpen: true', () => {
    const { container } = renderSidebar();
    
    act(() => {
      eventCallback({ isOpen: true });
    });
    
    expect(container.querySelector('.sidebar--open')).toBeInTheDocument();
  });

  it('closes sidebar when receiving toggle event with isOpen: false', () => {
    const { container } = renderSidebar();
    
    act(() => {
      eventCallback({ isOpen: true });
    });
    
    act(() => {
      eventCallback({ isOpen: false });
    });
    
    expect(container.querySelector('.sidebar--open')).not.toBeInTheDocument();
  });

  it('unsubscribes from EventBus on unmount', () => {
    const unsubscribe = vi.fn();
    EventBus.on.mockReturnValue(unsubscribe);
    
    const { unmount } = renderSidebar();
    unmount();
    
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('renders navigation icons', () => {
    renderSidebar();
    const images = screen.getAllByRole('img', { hidden: true });
    expect(images.length).toBeGreaterThan(0);
  });

  it('has correct link destinations', () => {
    renderSidebar();
    
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Add Items').closest('a')).toHaveAttribute('href', '/add');
    expect(screen.getByText('List Items').closest('a')).toHaveAttribute('href', '/list');
    expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/orders');
  });
});
