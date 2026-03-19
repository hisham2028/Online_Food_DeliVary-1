/**
 * Orders — Page Component
 *
 * Patterns:
 *   Repository      – orderRepo abstracts all API calls
 *   Model           – raw data → Order model with domain methods
 *   Observer        – emits ORDER_STATUS_CHANGED on status update
 *   Dependency Inj. – services from useServices()
 *   Sub-components  – OrderCard, StatusSelect
 */
import React, { useEffect, useState, useCallback } from 'react';
import './orders.css';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
import { useServices } from '../../App';
import { Order, ORDER_STATUSES } from '../../models';
import EventBus, { EVENTS } from '../../events/EventBus';

// ─── StatusSelect ──────────────────────────────────────────────────────────────
const StatusSelect = ({ orderId, currentStatus, onChange }) => (
  <select
    value={currentStatus}
    onChange={(e) => onChange(e.target.value, orderId)}
    className={`status-select status-select--${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}
    aria-label="Update order status"
  >
    {Object.values(ORDER_STATUSES).map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
);

// ─── OrderCard ─────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onStatusChange }) => (
  <div className="order-item">
    <img src={assets.parcel_icon} alt="" aria-hidden="true" />
    <div className="order-details">
      <p className="order-food">{order.itemSummary}</p>
      <p className="order-name">{order.address.fullName}</p>
      <div className="order-address">
        <span>{order.address.street},</span>
        <span>{order.address.cityLine}</span>
      </div>
      <p className="order-phone">{order.address.phone}</p>
    </div>
    <div className="order-meta">
      <span className="order-count">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
      <span className="order-amount">{order.formattedAmount}</span>
      <span className="order-date">{order.formattedDate}</span>
    </div>
    <StatusSelect
      orderId={order._id}
      currentStatus={order.status}
      onChange={onStatusChange}
    />
  </div>
);

// ─── Orders ────────────────────────────────────────────────────────────────────
const Orders = () => {
  const { orderRepo } = useServices();
  const [orders,    setOrders]    = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await orderRepo.getAll();
      setOrders(raw.map((r) => new Order(r)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orderRepo]);

  const handleStatusChange = async (newStatus, orderId) => {
    try {
      await orderRepo.updateStatus(orderId, newStatus);
      // Optimistic UI: mutate local state immediately
      setOrders((prev) =>
        prev.map((o) => o._id === orderId ? new Order({ ...o, status: newStatus }) : o)
      );
      // Observer: Dashboard will refresh its stats
      EventBus.emit(EVENTS.ORDER_STATUS_CHANGED, { orderId, newStatus });
    } catch (err) {
      toast.error(err.message);
      fetchOrders(); // rollback on failure
    }
  };

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="orders">
      <h3 className="orders-title">Orders</h3>
      {isLoading && <p className="state-msg">Loading orders…</p>}
      <div className="order-list">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default Orders;
