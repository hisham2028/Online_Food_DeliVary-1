/**
 * Dashboard — Page Component
 *
 * Patterns:
 *   Strategy        – OrderFilterContext applies swappable filter strategies
 *   Repository      – orderRepo.getAll() for data access
 *   Model           – Order[] and DashboardStats encapsulate domain logic
 *   Observer        – subscribes to ORDER_STATUS_CHANGED to refresh live
 *   Dependency Inj. – orderRepo from useServices()
 *   Configuration   – STAT_CARDS array drives stat cards; add a card = one entry
 *   Sub-components  – StatCard, FilterBar, OrdersTable
 */
import React, { useEffect, useState, useCallback } from 'react';
import './dashboard.css';
import { toast } from 'react-toastify';
import { useServices } from '../../App';
import { Order, DashboardStats } from '../../models';
import { OrderFilterContext } from '../../strategies/OrderFilterStrategy';
import EventBus, { EVENTS } from '../../events/EventBus';

// ─── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, title, value, variant }) => (
  <div className={`stat-card stat-card--${variant}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-details">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

// Configuration Object: add a new stat = one array entry
const STAT_CARDS = [
  { icon: '💰', title: 'Total Revenue',    variant: 'revenue',    key: 'formattedRevenue' },
  { icon: '📦', title: 'Total Orders',     variant: 'orders',     key: 'totalOrders'      },
  { icon: '👨‍🍳', title: 'Processing',     variant: 'processing', key: 'foodProcessing'   },
  { icon: '🚚', title: 'Out for Delivery', variant: 'delivery',   key: 'outForDelivery'   },
  { icon: '✅', title: 'Delivered',        variant: 'delivered',  key: 'delivered'        },
];

// ─── FilterBar ─────────────────────────────────────────────────────────────────
const FilterBar = ({ activePeriod, onSelect }) => (
  <div className="filter-bar">
    {OrderFilterContext.getAll().map((strategy) => (
      <button
        key={strategy.key}
        className={`filter-btn${activePeriod === strategy.key ? ' filter-btn--active' : ''}`}
        onClick={() => onSelect(strategy.key)}
      >
        {strategy.label}
      </button>
    ))}
  </div>
);

// ─── OrdersTable ───────────────────────────────────────────────────────────────
const OrdersTable = ({ orders }) => (
  <div className="orders-table">
    <div className="table-row table-header">
      <span>Order ID</span>
      <span>Customer</span>
      <span>Items</span>
      <span>Amount</span>
      <span>Status</span>
      <span>Date</span>
    </div>
    {orders.length === 0 && (
      <p className="table-empty">No orders for this period.</p>
    )}
    {orders.slice(0, 10).map((order) => (
      <div key={order._id} className="table-row">
        <span className="order-id">{order.shortId}</span>
        <span>{order.address.fullName}</span>
        <span>{order.items.length} items</span>
        <span className="amount">{order.formattedAmount}</span>
        <span className={`badge badge--${order.statusClass}`}>{order.status}</span>
        <span>{order.formattedDate}</span>
      </div>
    ))}
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { orderRepo } = useServices();
  const [allOrders,    setAllOrders]    = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading,    setIsLoading]    = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await orderRepo.getAll();
      setAllOrders(raw.map((r) => new Order(r)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orderRepo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Observer: refresh when an order status changes on the Orders page
  useEffect(() => {
    const unsub = EventBus.on(EVENTS.ORDER_STATUS_CHANGED, fetchOrders);
    return unsub;
  }, [fetchOrders]);

  // Strategy pattern: apply selected filter, then compute stats
  const filtered = OrderFilterContext.filter(allOrders, activeFilter);
  const stats    = new DashboardStats(filtered);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <FilterBar activePeriod={activeFilter} onSelect={setActiveFilter} />
      </div>

      {isLoading ? (
        <p className="state-msg">Loading dashboard…</p>
      ) : (
        <>
          <div className="stats-grid">
            {STAT_CARDS.map(({ icon, title, variant, key }) => (
              <StatCard
                key={key}
                icon={icon}
                title={title}
                value={stats[key]}
                variant={variant}
              />
            ))}
          </div>

          <div className="recent-orders">
            <h3>Recent Orders ({filtered.length})</h3>
            <OrdersTable orders={filtered} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
