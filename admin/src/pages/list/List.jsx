import React, { useEffect, useState, useCallback } from 'react';
import './list.css';
import { toast } from 'react-toastify';
import { useServices } from '../../App';
import { FoodItem } from '../../models';
import EventBus, { EVENTS } from '../../events/EventBus';

// ─── FoodRow ───────────────────────────────────────────────────────────────────
const FoodRow = ({ item, onRemove }) => (
  <div className="list-table-format">
    {/* ✅ image is now a full Cloudinary URL — no base URL needed */}
    <img src={item.image} alt={item.name} loading="lazy" />
    <p>{item.name}</p>
    <p>{item.category}</p>
    <p>{item.formattedPrice}</p>
    <button
      className="remove-btn"
      onClick={() => onRemove(item._id)}
      aria-label={`Remove ${item.name}`}
      title="Remove item"
    >
      ✕
    </button>
  </div>
);

const EmptyState   = () => <p className="state-msg">No food items yet. Add some from "Add Items".</p>;
const LoadingState = () => <p className="state-msg">Loading…</p>;

// ─── List ──────────────────────────────────────────────────────────────────────
const List = () => {
  const { foodRepo } = useServices();  // ✅ removed unused 'api'
  const [items,     setItems]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const raw = await foodRepo.getAll();
      setItems(raw.map((r) => new FoodItem(r)));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [foodRepo]);

  const handleRemove = async (foodId) => {
    try {
      const result = await foodRepo.remove(foodId);
      toast.success(result.message ?? 'Item removed.');
      setItems((prev) => prev.filter((i) => i._id !== foodId));
      EventBus.emit(EVENTS.FOOD_REMOVED, { foodId });
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    const unsub = EventBus.on(EVENTS.FOOD_ADDED, fetchItems);
    return unsub;
  }, [fetchItems]);

  return (
    <div className="list flex-col">
      <p className="list-title">All Food Items</p>
      <div className="list-table">
        <div className="list-table-format list-header">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {isLoading && <LoadingState />}
        {!isLoading && items.length === 0 && <EmptyState />}
        {!isLoading && items.map((item) => (
          <FoodRow
            key={item._id}
            item={item}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default List;
