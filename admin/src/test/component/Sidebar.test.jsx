/**
 * COMPONENT TEST — Admin Sidebar
 * Tests: renders nav links, active state, EventBus subscription
 */
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import Sidebar from '../../components/sidebar/Sidebar.jsx';

vi.mock('../../assets/assets', () => ({
  assets: {
    add_icon: 'add.png',
    order_icon: 'order.png',
    dashboard_icon: 'dash.png',
  },
}));

vi.mock('../../events/EventBus', () => ({
  default: { on: vi.fn(() => vi.fn()), emit: vi.fn() },
  EVENTS: { SIDEBAR_TOGGLE: 'sidebar:toggle' },
}));

const renderSidebar = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Sidebar />
    </MemoryRouter>
  );

describe('Sidebar Component', () => {
  test('renders all navigation links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Items')).toBeInTheDocument();
    expect(screen.getByText('List Items')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  test('renders sidebar element with correct class', () => {
    const { container } = renderSidebar();
    expect(container.querySelector('aside.sidebar')).toBeInTheDocument();
  });

  test('links point to correct routes', () => {
    renderSidebar();
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/add');
    expect(hrefs).toContain('/list');
    expect(hrefs).toContain('/orders');
  });

  test('active link gets active class', () => {
    renderSidebar('/add');
    const addLink = screen.getByText('Add Items').closest('a');
    expect(addLink.className).toContain('active');
  });

  test('subscribes to SIDEBAR_TOGGLE on mount', async () => {
    const { default: EventBus } = await import('../../events/EventBus');
    renderSidebar();
    expect(EventBus.on).toHaveBeenCalledWith('sidebar:toggle', expect.any(Function));
  });
});
