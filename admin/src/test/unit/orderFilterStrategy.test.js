/**
 * UNIT TEST — OrderFilterStrategy
 * Tests: AllTime, Today, Week, Month, Year strategies + OrderFilterContext
 */
import { describe, test, expect } from 'vitest';
import { OrderFilterContext } from '../../strategies/OrderFilterStrategy.js';
import { Order } from '../../models/index.js';

const makeOrder = (dateStr) => new Order({
  _id: 'abc123def456', amount: 10, status: 'Delivered',
  items: [{ name: 'Pizza', quantity: 1 }], address: {},
  date: dateStr,
});

const now = new Date();
const todayOrder     = makeOrder(now.toISOString());
const yesterdayOrder  = makeOrder(new Date(Date.now() - 2 * 86_400_000).toISOString());
const lastMonthOrder = makeOrder(new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString());
const lastYearOrder  = makeOrder(new Date(now.getFullYear() - 1, 6, 15).toISOString());

const allOrders = [todayOrder, yesterdayOrder, lastMonthOrder, lastYearOrder];

describe('OrderFilterContext', () => {
  test('getAll() returns 5 strategies', () => {
    expect(OrderFilterContext.getAll()).toHaveLength(5);
  });

  test('each strategy has key and label', () => {
    OrderFilterContext.getAll().forEach((s) => {
      expect(typeof s.key).toBe('string');
      expect(typeof s.label).toBe('string');
    });
  });

  test('getByKey("all") returns AllTimeStrategy', () => {
    const s = OrderFilterContext.getByKey('all');
    expect(s.key).toBe('all');
    expect(s.label).toBe('All Time');
  });

  test('getByKey returns first strategy for unknown key', () => {
    const s = OrderFilterContext.getByKey('unknown');
    expect(s.key).toBe('all');
  });

  // ─── filter() with each strategy ──────────────────────────
  test('filter "all" returns every order', () => {
    const result = OrderFilterContext.filter(allOrders, 'all');
    expect(result).toHaveLength(4);
  });

  test('filter "day" returns only today\'s orders', () => {
    const result = OrderFilterContext.filter(allOrders, 'day');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(todayOrder);
  });

  test('filter "week" returns orders within 7 days', () => {
    const result = OrderFilterContext.filter(allOrders, 'week');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result).toContain(todayOrder);
    expect(result).not.toContain(lastYearOrder);
  });

  test('filter "month" returns only current month orders', () => {
    const result = OrderFilterContext.filter(allOrders, 'month');
    expect(result).toContain(todayOrder);
    expect(result).not.toContain(lastYearOrder);
  });

  test('filter "year" returns only current year orders', () => {
    const result = OrderFilterContext.filter(allOrders, 'year');
    expect(result).toContain(todayOrder);
    expect(result).not.toContain(lastYearOrder);
  });
});
